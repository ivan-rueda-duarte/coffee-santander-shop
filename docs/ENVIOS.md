# Política de envíos — De Santander (v1, 05/11/2026)

Fuente de verdad: `data/tarifas_envio.csv` y `data/zonas_envio.csv`. Este documento explica las reglas; los números viven en los CSV.

## 1. Modelo

- Despacho desde Bucaramanga.
- Sin cotizador en vivo ni API: el sitio calcula el envío con una tabla de zonas × escalones de peso.
- Las guías se generan a mano, pedido a pedido, en el panel de un agregador (Envia.com o Mipaquete.com). Zona 1 va por mensajero (domiciliario, DiDi Entrega Light o Uber Courier).
- El valor del envío se muestra en el carrito y viaja sumado en el mensaje de WhatsApp. El cliente conoce el total antes de confirmar (Ley 1480 de 2011, art. 50).

## 2. Zonas

| Zona | Cobertura | Medio |
|---|---|---|
| 1 | Bucaramanga, Floridablanca, Piedecuesta, Girón | Mensajero; tarifa por municipio |
| 2 | Resto de Santander | Transportadora |
| 3 | Capitales y ciudades principales (lista en `zonas_envio.csv`) | Transportadora |
| 4 | Resto del país con cobertura normal (valor por defecto) | Transportadora |
| 5 | Trayecto especial: Amazonas, Guainía, Vaupés, Vichada, Guaviare, Putumayo, Caquetá (salvo Florencia), Chocó (salvo Quibdó), Arauca (salvo capital), San Andrés, Pacífico (Tumaco, Timbiquí, Guapi, López de Micay, Bahía Solano, Nuquí), Alta Guajira (Uribia, Manaure) | Sin tarifa publicada: "por cotizar" |

Precedencia al resolver la zona de un destino: fila `municipio` > fila `departamento` > zona 4.

## 3. Peso facturable y escalones

- Peso facturable = suma de las bolsas + 80 g de empaque (`EMPAQUE_G`).
- Escalones: ≤ 1 kg, 1–2 kg, 2–5 kg. Se toma el primer escalón cuyo límite sea ≥ al peso.
- > 5 kg: "por cotizar" en cualquier zona.

## 4. Regla "por cotizar"

Aplica cuando la zona es 5 o el peso supera 5 kg. El carrito no suma envío, muestra "Envío por cotizar · te confirmamos el valor por WhatsApp antes de que pagues" y el mensaje sale con `Envío: POR COTIZAR (zona especial)` o `Envío: POR COTIZAR (más de 5 kg)`. El total del mensaje se marca como "sin envío". Nunca se cobra primero y se ajusta después.

## 5. Tarifas publicadas (COP)

Criterio: punto medio del rango cotizado + 10 % de colchón, redondeado a la centena. Zona 3 ajustada manualmente al alza.

| Destino / zona | ≤ 1 kg | 1–2 kg | 2–5 kg |
|---|---|---|---|
| Bucaramanga | 8.800 | 11.600 | 15.400 |
| Floridablanca | 9.900 | 13.200 | 17.600 |
| Piedecuesta | 12.700 | 16.500 | 21.500 |
| Girón | 10.500 | 14.300 | 18.700 |
| Zona 2 | 12.100 | 16.200 | 22.000 |
| Zona 3 | 18.000 | 23.000 | 33.000 |
| Zona 4 | 22.000 | 28.100 | 37.400 |
| Zona 5 | por cotizar | por cotizar | por cotizar |

Revisar cada enero (ajuste por IPC de las transportadoras).

## 6. Textos para la página de envíos

- Plazos: zona 1, mismo día o siguiente hábil; zonas 2–3, 1–3 días hábiles; zona 4, 2–6 días hábiles; zona 5, 5–12 días hábiles y entrega en oficina de la transportadora.
- En municipios sin reparto a domicilio la guía puede cerrar en "reclamar en oficina".
- Pedido mínimo sugerido: 2 bolsas de 250 g o 1 de 500 g (una bolsa suelta paga como 1 kg).

## 7. Pendientes (TODO(dato))

- Confirmar lista final de ciudades de zona 3 con el cliente.
- Confirmar plazos de entrega por zona con el agregador.
- Verificar cobertura de zona 5 en el agregador antes de prometer entrega; sin ruta privada, usar 4-72.
