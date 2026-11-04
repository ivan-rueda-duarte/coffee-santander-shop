"""Genera js/mapa.js (trazado SVG de Santander) y la tabla municipio -> provincia.

Entrada: GeoJSON del Marco Geoestadístico Nacional 2018 (DANE), municipios.
Provincias: anexo de municipios de Santander (Wikipedia). Tona queda por verificar.
Uso (desde la raíz del proyecto):
  curl -L -o /tmp/mpios.geojson https://raw.githubusercontent.com/caticoa3/colombia_mapa/master/co_2018_MGN_MPIO_POLITICO.geojson
  python3 -I tools/build_mapa.py /tmp/mpios.geojson js/mapa.js /tmp/tabla.js
La tabla generada es la que va en MUNICIPIO_PROVINCIA de js/data.js.
"""
import json, math, sys, unicodedata
from collections import defaultdict

PROVINCIAS = {
    "Aguada": "Vélez", "Albania": "Vélez", "Aratoca": "Guanentá", "Barbosa": "Vélez",
    "Barichara": "Guanentá", "Barrancabermeja": "Yariguíes", "Betulia": "Yariguíes",
    "Bolívar": "Vélez", "Bucaramanga": "Metropolitana", "Cabrera": "Guanentá",
    "California": "Soto", "Capitanejo": "García Rovira", "Carcasí": "García Rovira",
    "Cepitá": "García Rovira", "Cerrito": "García Rovira", "Charalá": "Guanentá",
    "Charta": "Soto", "Chima": "Comunera", "Chipatá": "Vélez", "Cimitarra": "Vélez",
    "Concepción": "García Rovira", "Confines": "Comunera", "Contratación": "Comunera",
    "Coromoro": "Guanentá", "Curití": "Guanentá", "El Carmen de Chucurí": "Yariguíes",
    "El Guacamayo": "Comunera", "El Peñón": "Vélez", "El Playón": "Metropolitana",
    "Encino": "Guanentá", "Enciso": "García Rovira", "Florián": "Vélez",
    "Floridablanca": "Metropolitana", "Galán": "Comunera", "Gámbita": "Comunera",
    "Girón": "Metropolitana", "Guaca": "García Rovira", "Guadalupe": "Comunera",
    "Guapotá": "Comunera", "Guavatá": "Vélez", "Güepsa": "Vélez", "Hato": "Comunera",
    "Jesús María": "Vélez", "Jordán": "Guanentá", "La Belleza": "Vélez", "La Paz": "Vélez",
    "Landázuri": "Vélez", "Lebrija": "Metropolitana", "Los Santos": "Metropolitana",
    "Macaravita": "García Rovira", "Málaga": "García Rovira", "Matanza": "Soto",
    "Mogotes": "Guanentá", "Molagavita": "García Rovira", "Ocamonte": "Guanentá",
    "Oiba": "Comunera", "Onzaga": "Guanentá", "Palmar": "Comunera",
    "Palmas del Socorro": "Comunera", "Páramo": "Guanentá", "Piedecuesta": "Metropolitana",
    "Pinchote": "Guanentá", "Puente Nacional": "Vélez", "Puerto Parra": "Vélez",
    "Puerto Wilches": "Yariguíes", "Rionegro": "Metropolitana", "Sabana de Torres": "Yariguíes",
    "San Andrés": "García Rovira", "San Benito": "Vélez", "San Gil": "Guanentá",
    "San Joaquín": "Guanentá", "San José de Miranda": "García Rovira",
    "San Miguel": "García Rovira", "San Vicente de Chucurí": "Yariguíes",
    "Santa Bárbara": "Metropolitana", "Santa Helena del Opón": "Comunera",
    "Simacota": "Comunera", "Socorro": "Comunera", "Suaita": "Comunera", "Sucre": "Vélez",
    "Suratá": "Soto", "Tona": None, "Valle de San José": "Guanentá", "Vélez": "Vélez",
    "Vetas": "Soto", "Villanueva": "Guanentá", "Zapatoca": "Metropolitana",
}

def slug(t):
    t = unicodedata.normalize("NFD", t)
    return "".join(c for c in t if not unicodedata.combining(c)).upper().strip()

by_slug = {slug(k): k for k in PROVINCIAS}

geo = json.load(open(sys.argv[1]))
feats = [f for f in geo["features"] if f["properties"].get("DPTO_CCDGO") == "68"]
assert len(feats) == 87, len(feats)

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
edges = defaultdict(list)          # arista -> [provincia, ...]
for f in feats:
    nombre_geo = f["properties"]["MPIO_CNMBR"]
    nombre = by_slug.get(slug(nombre_geo))
    assert nombre, nombre_geo
    prov = PROVINCIAS[nombre]
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
    municipios.append({"nombre": nombre, "provincia": prov, "d": "".join(parts),
                       "c": [round(cx, 1), round(cy, 1)], "lonlat": [round(lon, 3), round(lat, 3)],
                       "area": abs(area_sum) / 2})

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
with open(sys.argv[2], "w") as fh:
    fh.write("// Mapa de Santander generado a partir de datos públicos; no editar a mano.\n")
    fh.write("// " + data["fuente"] + "\n")
    fh.write("// Regenerar con el script build_mapa.py si cambian los límites.\n")
    fh.write("const MAPA_SANTANDER = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")

with open(sys.argv[3], "w") as fh:
    for nombre in sorted(PROVINCIAS, key=lambda n: slug(n)):
        prov = PROVINCIAS[nombre]
        if prov:
            fh.write(f'  "{nombre}": "{prov}",\n')
print("provincias:", {k: sum(1 for m in municipios if m["provincia"] == k) for k in provincias}, file=sys.stderr)
