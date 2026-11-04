"""Genera src/data/mapa-santander.json (trazado SVG de Santander) desde los límites del DANE.

Entrada: GeoJSON del Marco Geoestadístico Nacional 2018 (DANE), municipios.
La tabla municipio -> provincia ya no vive aquí: se lee de data/municipios.csv y data/provincias.csv.
Uso (desde la raíz del proyecto):
  curl -L -o /tmp/mpios.geojson https://raw.githubusercontent.com/caticoa3/colombia_mapa/master/co_2018_MGN_MPIO_POLITICO.geojson
  python3 -I tools/build_mapa.py /tmp/mpios.geojson [salida.json] [--rellenar-divipola]

--rellenar-divipola escribe en data/municipios.csv el código DIVIPOLA de los municipios que no lo tengan.
Sin esa opción, solo avisa si el código del CSV no coincide con el del DANE.
"""
import csv, json, math, os, sys, unicodedata
from collections import defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_MUNICIPIOS = os.path.join(RAIZ, "data", "municipios.csv")
CSV_PROVINCIAS = os.path.join(RAIZ, "data", "provincias.csv")

args = [a for a in sys.argv[1:] if not a.startswith("--")]
rellenar = "--rellenar-divipola" in sys.argv
if not args:
    sys.exit(__doc__)
ruta_geo = args[0]
ruta_salida = args[1] if len(args) > 1 else os.path.join(RAIZ, "src", "data", "mapa-santander.json")


def slug(t):
    t = unicodedata.normalize("NFD", t)
    return "".join(c for c in t if not unicodedata.combining(c)).upper().strip()


def leer_csv(ruta):
    with open(ruta, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


provincias_csv = leer_csv(CSV_PROVINCIAS)
filas_municipios = leer_csv(CSV_MUNICIPIOS)
slugs_provincia = {p["slug"] for p in provincias_csv}
por_nombre = {}
for fila in filas_municipios:
    ps = fila["provincia_slug"].strip() or None
    if ps and ps not in slugs_provincia:
        sys.exit(f'data/municipios.csv: "{fila["nombre"]}" usa la provincia "{ps}", que no existe en provincias.csv')
    por_nombre[slug(fila["nombre"])] = fila

geo = json.load(open(ruta_geo, encoding="utf-8"))
feats = [f for f in geo["features"] if f["properties"].get("DPTO_CCDGO") == "68"]
assert len(feats) == 87, len(feats)
faltan = [f["properties"]["MPIO_CNMBR"] for f in feats if slug(f["properties"]["MPIO_CNMBR"]) not in por_nombre]
if faltan:
    sys.exit(f"Municipios del DANE que no están en data/municipios.csv: {', '.join(faltan)}")

# Proyección equirectangular centrada (suficiente a esta escala)
lons = [p[0] for f in feats for r in f["geometry"]["coordinates"] for p in r]
lats = [p[1] for f in feats for r in f["geometry"]["coordinates"] for p in r]
lon0, lat0 = (min(lons) + max(lons)) / 2, (min(lats) + max(lats)) / 2
cosl = math.cos(math.radians(lat0))
minx, maxx = (min(lons) - lon0) * cosl, (max(lons) - lon0) * cosl
miny, maxy = -(max(lats) - lat0), -(min(lats) - lat0)
W = 1000.0
k = W / (maxx - minx)
H = (maxy - miny) * k
PAD = 24


def proj(lon, lat):
    return ((lon - lon0) * cosl * k - minx * k + PAD, (-(lat - lat0)) * k - miny * k + PAD)


def fmt(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


municipios = []
edges = defaultdict(list)  # arista -> [provincia, ...]
cambios_divipola = {}
for f in feats:
    fila = por_nombre[slug(f["properties"]["MPIO_CNMBR"])]
    prov = fila["provincia_slug"].strip() or None
    divipola = f["properties"]["MPIO_CCNCT"]
    if fila["divipola"].strip() != divipola:
        cambios_divipola[fila["slug"]] = divipola
    parts, area_sum, cx_sum, cy_sum = [], 0.0, 0.0, 0.0
    for ring in f["geometry"]["coordinates"]:
        pts = [proj(*p[:2]) for p in ring]
        parts.append("M" + "L".join(f"{fmt(x)} {fmt(y)}" for x, y in pts[:-1]) + "Z")
        for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
            cr = x1 * y2 - x2 * y1
            area_sum += cr; cx_sum += (x1 + x2) * cr; cy_sum += (y1 + y2) * cr
        raw = [tuple(round(c, 6) for c in p[:2]) for p in ring]
        for a, b in zip(raw, raw[1:]):
            edges[tuple(sorted((a, b)))].append(prov or "?")
    cx, cy = cx_sum / (3 * area_sum), cy_sum / (3 * area_sum)
    # Centroide en grados para mostrar coordenadas
    lon = (cx - PAD + minx * k) / (cosl * k) + lon0
    lat = lat0 - (cy - PAD + miny * k) / k
    municipios.append({"slug": fila["slug"], "nombre": fila["nombre"], "divipola": divipola, "provincia": prov,
                       "d": "".join(parts), "c": [round(cx, 1), round(cy, 1)],
                       "lonlat": [round(lon, 3), round(lat, 3)], "area": abs(area_sum) / 2})

shared = sum(1 for v in edges.values() if len(v) == 2)
outer = [e for e, v in edges.items() if len(v) == 1]
between = [e for e, v in edges.items() if len(v) == 2 and v[0] != v[1]]
print(f"aristas: {len(edges)} compartidas: {shared} contorno: {len(outer)} entre provincias: {len(between)}", file=sys.stderr)


def seg_path(segs):
    out = []
    for a, b in segs:
        (x1, y1), (x2, y2) = proj(*a), proj(*b)
        out.append(f"M{fmt(x1)} {fmt(y1)}L{fmt(x2)} {fmt(y2)}")
    return "".join(out)


provs = defaultdict(lambda: {"area": 0.0, "cx": 0.0, "cy": 0.0, "xs": [], "ys": []})
for m in municipios:
    if not m["provincia"]:
        continue
    p = provs[m["provincia"]]
    p["area"] += m["area"]; p["cx"] += m["c"][0] * m["area"]; p["cy"] += m["c"][1] * m["area"]
for f, m in zip(feats, municipios):
    if not m["provincia"]:
        continue
    for ring in f["geometry"]["coordinates"]:
        for pt in ring:
            x, y = proj(*pt[:2]); provs[m["provincia"]]["xs"].append(x); provs[m["provincia"]]["ys"].append(y)

provincias = {}
for name, p in sorted(provs.items()):
    x0, x1, y0, y1 = min(p["xs"]), max(p["xs"]), min(p["ys"]), max(p["ys"])
    provincias[name] = {"c": [round(p["cx"] / p["area"], 1), round(p["cy"] / p["area"], 1)],
                        "bbox": [round(x0, 1), round(y0, 1), round(x1 - x0, 1), round(y1 - y0, 1)]}

for m in municipios:
    del m["area"]

data = {
    "fuente": "Límites municipales: DANE, Marco Geoestadístico Nacional 2018. Provincias: anexo de municipios de Santander (Wikipedia).",
    "viewBox": [0, 0, round(W + 2 * PAD, 1), round(H + 2 * PAD, 1)],
    "proyeccion": {"lon0": round(lon0, 6), "lat0": round(lat0, 6), "cos": round(cosl, 8), "k": round(k, 6),
                   "dx": round(-minx * k + PAD, 4), "dy": round(-miny * k + PAD, 4)},
    "municipios": municipios,
    "contorno": seg_path(outer),
    "limitesProvincia": seg_path(between),
    "provincias": provincias,
}
os.makedirs(os.path.dirname(ruta_salida), exist_ok=True)
with open(ruta_salida, "w", encoding="utf-8") as fh:
    json.dump(data, fh, ensure_ascii=False, separators=(",", ":"))
    fh.write("\n")
print("provincias:", {k: sum(1 for m in municipios if m["provincia"] == k) for k in provincias}, file=sys.stderr)
print(f"escrito {os.path.relpath(ruta_salida, RAIZ)} ({len(municipios)} municipios)", file=sys.stderr)

if cambios_divipola:
    if rellenar:
        for fila in filas_municipios:
            if fila["slug"] in cambios_divipola:
                fila["divipola"] = cambios_divipola[fila["slug"]]
        with open(CSV_MUNICIPIOS, "w", encoding="utf-8", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=list(filas_municipios[0].keys()), lineterminator="\n")
            w.writeheader(); w.writerows(filas_municipios)
        print(f"data/municipios.csv: escribí {len(cambios_divipola)} códigos DIVIPOLA", file=sys.stderr)
    else:
        print(f"AVISO: {len(cambios_divipola)} municipios con DIVIPOLA vacío o distinto al del DANE; usa --rellenar-divipola", file=sys.stderr)
