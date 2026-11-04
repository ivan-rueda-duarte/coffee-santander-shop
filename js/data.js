// =========================================================
// Datos de la tienda De Santander
// =========================================================

// Datos de la tienda. Se usan en el carrito, el mensaje de WhatsApp y el pie de página.
// `whatsapp`: número con indicativo de país, solo dígitos (57 = Colombia).
const TIENDA = {
  nombre: "De Santander",
  whatsapp: "573001129874",
  ciudad_despacho: "Bucaramanga",
  envio: "Enviamos a todo Colombia desde Bucaramanga. El costo del envío se confirma por WhatsApp según tu ciudad.",
  pagos: ["Efectivo contraentrega", "Transferencia Bre-B"]
};

// Presentaciones de respaldo. Cada café debe traer su propia lista `presentaciones`
// con sus precios; esta solo se usa (con aviso en consola) si a un café le falta.
const PRESENTACIONES = [
  { gramos: 250, precio_cop: 25000 },
  { gramos: 500, precio_cop: 50000 }
];

// Opciones de molienda. El precio no cambia.
const MOLIENDAS = ["Grano entero", "Molido"];

// Cantidad máxima de bolsas por línea del carrito.
const MAX_CANTIDAD = 20;

// Provincias de Santander, con los nombres del anexo de municipios de Santander
// (Wikipedia). La clave aparece en la tabla de municipios y en la URL
// (?provincia=<slug>). `color` es el relleno de la provincia en el mapa (tinta de
// mapa en las cinco familias de la marca: arcilla, neutro, oro, tierra y verde). `descripcion` es el texto corto (2 líneas) que acompaña a la
// provincia en el índice: edítalo libremente. Mientras diga "por completar" no se
// muestra en la tienda.
const PROVINCIAS = {
  "Comunera": {
    nombre: "Provincia Comunera",
    slug: "comunera",
    color: "#efc2a6",
    descripcion: "Cuna de la Revolución de los Comuneros de 1781, con Socorro y Oiba. Cafés dulces y equilibrados, con notas de cacao, caramelo y frutos rojos."
  },
  "García Rovira": {
    nombre: "Provincia de García Rovira",
    slug: "garcia-rovira",
    color: "#d3d6cd",
    descripcion: "Montañas altas de la cordillera Oriental, con Málaga como capital. Cafés suaves y delicados, de perfil floral y dulzor a miel."
  },
  "Guanentá": {
    nombre: "Provincia de Guanentá",
    slug: "guanenta",
    color: "#f0d68a",
    descripcion: "Tierra de cañones y pueblos de piedra como San Gil y Barichara. Cafés aromáticos, de acidez brillante, con notas cítricas, florales y especiadas."
  },
  "Metropolitana": {
    nombre: "Provincia Metropolitana",
    slug: "metropolitana",
    color: "#dcc592",
    descripcion: "Descripción por completar."
  },
  "Soto": {
    nombre: "Provincia de Soto",
    slug: "soto",
    color: "#bdd9b6",
    descripcion: "Descripción por completar."
  },
  "Vélez": {
    nombre: "Provincia de Vélez",
    slug: "velez",
    color: "#8fc2a0",
    descripcion: "Descripción por completar."
  },
  "Yariguíes": {
    nombre: "Provincia de Yariguíes",
    slug: "yariguies",
    color: "#b8bcb1",
    descripcion: "Descripción por completar."
  }
};

// Tabla municipio → provincia de los 86 municipios con provincia asignada, según el
// anexo de municipios de Santander (Wikipedia). Tona no está: la fuente la ubica
// entre Metropolitana y Soto, así que queda por verificar.
const MUNICIPIO_PROVINCIA = {
  "Aguada": "Vélez",
  "Albania": "Vélez",
  "Aratoca": "Guanentá",
  "Barbosa": "Vélez",
  "Barichara": "Guanentá",
  "Barrancabermeja": "Yariguíes",
  "Betulia": "Yariguíes",
  "Bolívar": "Vélez",
  "Bucaramanga": "Metropolitana",
  "Cabrera": "Guanentá",
  "California": "Soto",
  "Capitanejo": "García Rovira",
  "Carcasí": "García Rovira",
  "Cepitá": "García Rovira",
  "Cerrito": "García Rovira",
  "Charalá": "Guanentá",
  "Charta": "Soto",
  "Chima": "Comunera",
  "Chipatá": "Vélez",
  "Cimitarra": "Vélez",
  "Concepción": "García Rovira",
  "Confines": "Comunera",
  "Contratación": "Comunera",
  "Coromoro": "Guanentá",
  "Curití": "Guanentá",
  "El Carmen de Chucurí": "Yariguíes",
  "El Guacamayo": "Comunera",
  "El Peñón": "Vélez",
  "El Playón": "Metropolitana",
  "Encino": "Guanentá",
  "Enciso": "García Rovira",
  "Florián": "Vélez",
  "Floridablanca": "Metropolitana",
  "Galán": "Comunera",
  "Gámbita": "Comunera",
  "Girón": "Metropolitana",
  "Guaca": "García Rovira",
  "Guadalupe": "Comunera",
  "Guapotá": "Comunera",
  "Guavatá": "Vélez",
  "Güepsa": "Vélez",
  "Hato": "Comunera",
  "Jesús María": "Vélez",
  "Jordán": "Guanentá",
  "La Belleza": "Vélez",
  "La Paz": "Vélez",
  "Landázuri": "Vélez",
  "Lebrija": "Metropolitana",
  "Los Santos": "Metropolitana",
  "Macaravita": "García Rovira",
  "Málaga": "García Rovira",
  "Matanza": "Soto",
  "Mogotes": "Guanentá",
  "Molagavita": "García Rovira",
  "Ocamonte": "Guanentá",
  "Oiba": "Comunera",
  "Onzaga": "Guanentá",
  "Palmar": "Comunera",
  "Palmas del Socorro": "Comunera",
  "Páramo": "Guanentá",
  "Piedecuesta": "Metropolitana",
  "Pinchote": "Guanentá",
  "Puente Nacional": "Vélez",
  "Puerto Parra": "Vélez",
  "Puerto Wilches": "Yariguíes",
  "Rionegro": "Metropolitana",
  "Sabana de Torres": "Yariguíes",
  "San Andrés": "García Rovira",
  "San Benito": "Vélez",
  "San Gil": "Guanentá",
  "San Joaquín": "Guanentá",
  "San José de Miranda": "García Rovira",
  "San Miguel": "García Rovira",
  "San Vicente de Chucurí": "Yariguíes",
  "Santa Bárbara": "Metropolitana",
  "Santa Helena del Opón": "Comunera",
  "Simacota": "Comunera",
  "Socorro": "Comunera",
  "Suaita": "Comunera",
  "Sucre": "Vélez",
  "Suratá": "Soto",
  "Valle de San José": "Guanentá",
  "Vélez": "Vélez",
  "Vetas": "Soto",
  "Villanueva": "Guanentá",
  "Zapatoca": "Metropolitana"
};

const PROVINCIA_POR_VERIFICAR = "Por verificar";

// Catálogo. `provincia` no se escribe a mano: se completa abajo a partir del
// municipio usando MUNICIPIO_PROVINCIA.
//
// Campos sin dato todavía (la página los oculta mientras estén vacíos):
//   finca: ""            → nombre de la finca
//   imagen: ""           → ruta de la foto, ej. "img/barichara.jpg" (crea la carpeta img/ al agregar fotos)
//   disponible: true     → false muestra "Agotado" y desactiva la compra
//   presentaciones       → tamaños y precios de ESTE café; edita aquí el precio de cada bolsa
//   puntaje_cata         → puntaje de taza en la escala SCA (80 o más es café de especialidad)
const CAFES = [
  {
    id: 1,
    nombre: "Café Altura de Socorro",
    marca: "Café Altura de Socorro",
    municipio: "Socorro",
    finca: "",
    altura_msnm: 1800,
    variedad: "Caturra",
    proceso: "Lavado tradicional",
    perfil_taza: ["Caramelo", "Cacao", "Frutos rojos"],
    imagen: "",
    disponible: true,
    presentaciones: [
      { gramos: 250, precio_cop: 25000 },
      { gramos: 500, precio_cop: 50000 }
    ],
    descripcion_corta: "Café de especialidad con notas dulces y cuerpo equilibrado.",
    historia: "Cultivado por familias cafeteras de Socorro, con más de 30 años de tradición.",
    origen: "Municipio de Socorro, Santander.",
    tueste: "Medio",
    puntaje_cata: 88
  },
  {
    id: 2,
    nombre: "Café Barichara",
    marca: "Café Barichara",
    municipio: "Barichara",
    finca: "",
    altura_msnm: 1700,
    variedad: "Castillo",
    proceso: "Lavado controlado",
    perfil_taza: ["Naranja", "Miel", "Jazmín"],
    imagen: "",
    disponible: true,
    presentaciones: [
      { gramos: 250, precio_cop: 25000 },
      { gramos: 500, precio_cop: 50000 }
    ],
    descripcion_corta: "Café aromático, limpio y con una acidez muy elegante.",
    historia: "Producido en las montañas de Barichara, con enfoque en calidad y sostenibilidad.",
    origen: "Barichara, Santander.",
    tueste: "Medio claro",
    puntaje_cata: 90
  },
  {
    id: 3,
    nombre: "Café San Gil",
    marca: "Café San Gil",
    municipio: "San Gil",
    finca: "",
    altura_msnm: 1650,
    variedad: "Colombia",
    proceso: "Lavado",
    perfil_taza: ["Chocolate", "Nuez", "Especias"],
    imagen: "",
    disponible: true,
    presentaciones: [
      { gramos: 250, precio_cop: 25000 },
      { gramos: 500, precio_cop: 50000 }
    ],
    descripcion_corta: "Café con cuerpo intenso y una finalización muy persistente.",
    historia: "Una marca nacida en San Gil, destacada por su perfil fuerte y consistente.",
    origen: "San Gil, Santander.",
    tueste: "Medio oscuro",
    puntaje_cata: 86
  },
  {
    id: 4,
    nombre: "Café Málaga",
    marca: "Café Málaga",
    municipio: "Málaga",
    finca: "",
    altura_msnm: 1850,
    variedad: "Typica",
    proceso: "Lavado especial",
    perfil_taza: ["Floral", "Manzana", "Miel"],
    imagen: "",
    disponible: true,
    presentaciones: [
      { gramos: 250, precio_cop: 25000 },
      { gramos: 500, precio_cop: 50000 }
    ],
    descripcion_corta: "Café suave, floral y con excelente balance.",
    historia: "Cultivado en las alturas de Málaga, con un proceso cuidadoso desde la cosecha.",
    origen: "Málaga, Santander.",
    tueste: "Claro",
    puntaje_cata: 91
  },
  {
    id: 5,
    nombre: "Café Oiba",
    marca: "Café Oiba",
    municipio: "Oiba",
    finca: "",
    altura_msnm: 1750,
    variedad: "Bourbon",
    proceso: "Lavado premium",
    perfil_taza: ["Cereza", "Canela", "Cacao"],
    imagen: "",
    disponible: true,
    presentaciones: [
      { gramos: 250, precio_cop: 25000 },
      { gramos: 500, precio_cop: 50000 }
    ],
    descripcion_corta: "Café complejo, con notas frutales y un toque de especias.",
    historia: "Originario de Oiba, conocido por su perfil de alta calidad y buena estructura.",
    origen: "Oiba, Santander.",
    tueste: "Medio",
    puntaje_cata: 89
  }
];

// Completar cada café: provincia según su municipio y, si falta, presentaciones de respaldo.
CAFES.forEach(cafe => {
  cafe.provincia = MUNICIPIO_PROVINCIA[cafe.municipio] || PROVINCIA_POR_VERIFICAR;
  if (!Array.isArray(cafe.presentaciones) || cafe.presentaciones.length === 0) {
    console.warn(`[De Santander] "${cafe.nombre}" no tiene presentaciones; se usan las de respaldo.`);
    cafe.presentaciones = PRESENTACIONES;
  }
});
