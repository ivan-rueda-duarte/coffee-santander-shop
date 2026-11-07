import re, subprocess, sys, pathlib
L = pathlib.Path("/home/ivan/Code/coffee-santander-shop/docs/legal")
OUT = pathlib.Path(sys.argv[1]); TMP = pathlib.Path(sys.argv[2])
docs = [
 ("terminos-y-condiciones.md","Documento 1. Términos y condiciones de compra"),
 ("politica-tratamiento-datos.md","Documento 2. Política de tratamiento de datos personales"),
 ("envios-devoluciones-retracto.md","Documento 3. Envíos, devoluciones, retracto y garantía"),
 ("informacion-vendedor.md","Documento 4. Información del vendedor"),
 ("microcopy-legal.md","Documento 5. Textos legales del sitio (casillas, resumen, mensaje de WhatsApp)"),
]
def notas(t):
    # comentarios de varias líneas o de una línea: pasan a notas visibles para el abogado
    def bloque(m):
        c = re.sub(r"\s+"," ",m.group(2)).strip()
        return f"{m.group(1)}\n\n> **Nota para el abogado:** {c}\n\n"
    t = re.sub(r"(^|\n)[ \t]*<!--(.*?)-->[ \t]*(?=\n|$)", bloque, t, flags=re.S)
    t = re.sub(r"<!--(.*?)-->", lambda m: " *[Nota para el abogado: "+re.sub(r"\s+"," ",m.group(1)).strip()+"]*", t, flags=re.S)
    return t
def bajar(t):  # títulos un nivel más abajo para que cada documento sea un Título 1
    return re.sub(r"^(#{1,5}) ", lambda m: "#"*(len(m.group(1))+1)+" ", t, flags=re.M)
cab = f"""# Paquete de revisión para el abogado responsable

**De Santander SAS · tienda en línea de café · borradores v0.6 (2026-11-06)**

**Contenido:** Cómo usar este paquete · Decisiones para el abogado · Documento 1, Términos y condiciones · Documento 2, Política de tratamiento de datos · Documento 3, Envíos, devoluciones, retracto y garantía · Documento 4, Información del vendedor · Documento 5, Textos legales del sitio.

## Cómo usar este paquete

Estos son los borradores de los textos legales de la tienda en línea de De Santander SAS. Ninguno está publicado en el sitio ni aprobado. Puede editarlos directamente, comentar o activar el control de cambios de Word.

- **Qué debe revisar:** los cinco documentos siguientes y las preguntas de la sección «Decisiones para el abogado».
- **Convenciones:** `[TODO(dato): …]` es un dato que debe entregar el dueño o un tercero; `[DECISIÓN n]` es una decisión del dueño aún abierta; `VERIFICAR` marca una norma que no se pudo cotejar en fuente oficial. Las notas en recuadro («Nota para el abogado») explican el fundamento y las dudas de cada texto.
- **Qué hace la tienda:** el sitio es estático, no guarda pedidos ni datos personales. El cliente arma el pedido en la página y lo envía por WhatsApp; la compra se cierra en el chat. Pagos: efectivo contraentrega y transferencia Bre-B. Despacho desde Bucaramanga a todo Colombia.
- **Aprobación:** nada se publica hasta que usted lo apruebe. Cada documento lleva versión y fecha.

## Decisiones para el abogado

1. **L1.** Aprobar los cuatro documentos y los textos del sitio (documento 5).
2. **L2.** Confirmar que el café no admite retracto (alimento), a la luz del Concepto SIC 16-062808 de 2016 (leído en una copia de terceros) y de doctrina posterior.
3. **L3.** Decidir si la reversión del pago (art. 51 de la Ley 1480) aplica a transferencias Bre-B y qué debe decir el sitio. El dueño decidió ofrecer un compromiso propio de devolución; confirmar su redacción.
4. **L4.** Calificar a Meta (WhatsApp), al agregador de guías, a GitHub (alojamiento del sitio) y a Sanity como encargados o terceros, y decidir si hace falta contrato de transmisión internacional (art. 26 de la Ley 1581).
5. **L5.** Entregar el manual interno de políticas de datos (Ley 1581, art. 17 lit. k).
6. **L6.** Verificar el registro de la marca «De Santander» ante la SIC.
7. **L7.** Revisar la cláusula de «error evidente» de precio (términos, numeral 4): conservarla o eliminarla.
8. **L8.** Verificar la vigencia y el texto de las normas marcadas VERIFICAR en cada documento (Ley 1480, Ley 1581, Decreto 1377/1074, Ley 2300 de 2023, Ley 527, Código de Comercio, Resolución 2674 de 2013, Resolución 5109 de 2005).
"""
partes=[cab]
for f,t in docs:
    txt=(L/f).read_text(encoding="utf-8")
    txt=txt.split("\n---\n\n## Notas para el abogado")[0] if False else txt
    partes.append("\n\n<div class=\"nuevapag\"></div>\n\n# "+t+"\n\n"+bajar(notas(txt)))
import markdown
md=(TMP/"paquete.md"); md.write_text("\n".join(partes),encoding="utf-8")
html=markdown.markdown(md.read_text(encoding="utf-8"),extensions=["tables","sane_lists"])
html=html.replace('<div class="nuevapag"></div>\n<h1>','<h1 style="page-break-before:always">')
css="body{font-family:Arial;font-size:11pt;line-height:1.35} h1{font-size:18pt;color:#0a3f25} h2{font-size:14pt;color:#0a3f25} h3{font-size:12pt} table{border-collapse:collapse;width:100%} td,th{border:1px solid #999;padding:4px;font-size:9.5pt;vertical-align:top} th{background:#e6e8e2} blockquote{border-left:3px solid #a24f27;margin-left:0;padding-left:10px;color:#5a3a26;background:#f9e8dc} code{font-family:Consolas;font-size:10pt}"
h=TMP/"Paquete-revision-abogado.html"
h.write_text('<html><head><meta charset="utf-8"><style>'+css+'</style></head><body>'+html+'</body></html>',encoding="utf-8")
subprocess.run(["soffice","--headless","--convert-to","docx:MS Word 2007 XML","--outdir",str(OUT.parent),str(h)],check=True,capture_output=True)
print("ok")
