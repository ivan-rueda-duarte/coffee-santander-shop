"""Genera src/data/divipola.json (departamentos y municipios de Colombia) para el formulario de envío.

Fuente: el mismo GeoJSON del DANE (Marco Geoestadístico Nacional 2018) que usa build_mapa.py.
Uso: python3 -I tools/build_divipola.py /tmp/mpios.geojson [salida.json]
"""
import csv, json, os, sys, unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ruta_geo = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
salida = sys.argv[2] if len(sys.argv) > 2 else os.path.join(RAIZ, "src", "data", "divipola.json")

MINUSCULAS = {"de", "del", "la", "las", "los", "el", "y", "e"}


def titulo(nombre):
    palabras = nombre.lower().split(" ")
    res = []
    for i, p in enumerate(palabras):
        if i > 0 and p in MINUSCULAS:
            res.append(p)
        else:
            # respeta guiones y puntos: "san-josé", "d.c."
            res.append("-".join(s[:1].upper() + s[1:] for s in p.split("-")))
    return " ".join(res).replace("D.c.", "D.C.")


def sin_tildes(t):
    return "".join(c for c in unicodedata.normalize("NFD", t) if not unicodedata.combining(c)).lower()


# El GeoJSON pierde algunas tildes; los municipios de Santander se corrigen con data/municipios.csv.
CORRECCIONES = {"Quindio": "Quindío"}
santander = {}
ruta_csv = os.path.join(RAIZ, "data", "municipios.csv")
if os.path.exists(ruta_csv):
    with open(ruta_csv, encoding="utf-8-sig", newline="") as fh:
        santander = {f["divipola"]: f["nombre"] for f in csv.DictReader(fh) if f["divipola"]}

geo = json.load(open(ruta_geo, encoding="utf-8"))
deptos = {}
for f in geo["features"]:
    p = f["properties"]
    nombre_depto = titulo(p["DPTO_CNMBR"])
    d = deptos.setdefault(p["DPTO_CCDGO"], {"codigo": p["DPTO_CCDGO"], "nombre": CORRECCIONES.get(nombre_depto, nombre_depto), "municipios": []})
    d["municipios"].append({"codigo": p["MPIO_CCNCT"], "nombre": santander.get(p["MPIO_CCNCT"]) or titulo(p["MPIO_CNMBR"])})

lista = sorted(deptos.values(), key=lambda d: sin_tildes(d["nombre"]))
for d in lista:
    d["municipios"].sort(key=lambda m: sin_tildes(m["nombre"]))
os.makedirs(os.path.dirname(salida), exist_ok=True)
with open(salida, "w", encoding="utf-8") as fh:
    json.dump({"fuente": "DANE, Marco Geoestadístico Nacional 2018 (códigos DIVIPOLA)", "departamentos": lista}, fh, ensure_ascii=False, separators=(",", ":"))
    fh.write("\n")
print(f"{len(lista)} departamentos, {sum(len(d['municipios']) for d in lista)} municipios", file=sys.stderr)
