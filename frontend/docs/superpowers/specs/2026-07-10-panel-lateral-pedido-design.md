# Panel lateral de pedido (carrito)

## Contexto

Hoy el "pedido" (carrito) es una sección más al final de `home.component.html`, con todo el estado (`pedido`, `agregarAlPedido`, `quitarDelPedido`, `totalPedido`, `cantidadItems`, `linkPedidoWhatsapp`) definido localmente en `HomeComponent`. El botón "Pedido" del Header solo hace `scrollToPedido()` (scroll a la sección), y su badge está fijo en un signal local `cantidadItems = signal(0)` que nunca se actualiza (TODO ya documentado en `header.ts`).

`CatalogoComponent` tiene su propia interfaz `Piedra` (con `variedad` tipada como unión, `tipo: 'calibrada' | 'bruto'`, `calibreMm` opcional) distinta a la de Home, y su tarjeta muestra un botón "Ver detalle" que no hace nada.

## Objetivo

El pedido deja de ser una sección de la vista Home y pasa a ser un **panel lateral (overlay) global**, accesible desde cualquier página vía el botón del Header, con estado de carrito compartido entre Home y Catálogo.

## Arquitectura

### `PedidoService` (`src/app/services/pedido.service.ts`)

Servicio `providedIn: 'root'`, única fuente de verdad del carrito:

- `pedido` — signal de `ItemPedido[]`
- `totalPedido` — computed
- `cantidadItems` — computed
- `estaAbierto` — signal booleano, controla la visibilidad del panel
- `agregarAlPedido(piedra: Piedra)`
- `quitarDelPedido(piedraId: string)`
- `abrirPanel()`, `cerrarPanel()`, `togglePanel()`
- `linkPedidoWhatsapp()` — arma el link de WhatsApp con el detalle del pedido (misma lógica que hoy en `HomeComponent.linkPedidoWhatsapp`)

### Modelo unificado (`src/app/models/piedra.model.ts`)

Una única interfaz `Piedra` que reemplaza las dos declaraciones locales (Home y Catálogo):

```ts
export type Variedad = 'Cuarzo' | 'Turmalina' | 'Ágata' | 'Otras piedras';
export type Tipo = 'calibrada' | 'bruto';

export interface Piedra {
  id: string;
  nombre: string;
  variedad: Variedad | string;
  tipo?: Tipo;
  calibreMm?: number;
  precio: number;
  imagen: string;
  colorTag: 'agata' | 'malaquita';
  descripcion?: string;
}

export interface ItemPedido {
  piedra: Piedra;
  cantidad: number;
}
```

Home y Catálogo importan este modelo en lugar de declarar el propio. Los datos existentes de cada componente (arrays `catalogo()` / `piedras()`) se ajustan a la interfaz unificada sin perder información.

## Componentes

### `PanelPedido` (nuevo, `src/app/shared/panel-pedido/`)

Panel lateral overlay que se renderiza una sola vez en `app.html`, como hermano de `app-header` y fuera de `router-outlet`, para persistir entre rutas:

```html
<app-header></app-header>
<app-panel-pedido></app-panel-pedido>
<router-outlet></router-outlet>
```

Contenido (migrado desde la sección `pedido` actual de `home.component.html`):
- Estado vacío: "Todavía no agregaste piedras..."
- Lista de ítems (cantidad, nombre, calibre si existe, precio, botón quitar)
- Total
- Botón "Confirmar pedido por mensaje" (link de WhatsApp)
- Nota de coordinación de pago/envío

Estructura visual: overlay deslizante desde la derecha + fondo oscurecido (backdrop). Se cierra con botón X, click en el backdrop, o tecla Escape. Mientras está abierto, se bloquea el scroll del `body`.

Inyecta `PedidoService` y lee `estaAbierto()`, `pedido()`, `totalPedido()`; llama `cerrarPanel()`, `quitarDelPedido()`, `linkPedidoWhatsapp()`.

### `Header`

- El botón "Pedido" llama `pedidoService.togglePanel()` en lugar de `scrollToPedido()`.
- El badge lee `pedidoService.cantidadItems()` en lugar del signal local fijo.
- Se elimina `cantidadItems = signal(0)` y `scrollToPedido()` de `header.ts`.

### `HomeComponent`

- Se elimina la sección `<section class="pedido" id="pedido">` completa de `home.component.html`.
- Se elimina el estado y los métodos de pedido (`pedido`, `totalPedido`, `cantidadItems`, `agregarAlPedido`, `quitarDelPedido`, `scrollToPedido`, `linkPedidoWhatsapp`) de `home.component.ts`; se inyecta `PedidoService` y los botones "Agregar al pedido" (grid y destacada) llaman `pedidoService.agregarAlPedido(piedra)`.
- El array `catalogo()` pasa a tipar sus piedras con la interfaz unificada.

### `CatalogoComponent`

- El botón "Ver detalle" de cada tarjeta se reemplaza por "Agregar al pedido", llamando a `pedidoService.agregarAlPedido(piedra)`.
- El array `piedras()` pasa a tipar sus piedras con la interfaz unificada (sin cambios de datos).

## Comportamiento (UX)

- El panel **no se abre automáticamente** al agregar un ítem; solo se abre/cierra con el botón "Pedido" del Header. Agregar un ítem solo actualiza el badge.
- El panel es **global**: agregar desde Catálogo y luego navegar a Home (o viceversa) conserva el carrito, porque el estado vive en `PedidoService` y el panel se renderiza fuera del `router-outlet`.

## Casos borde y accesibilidad

- Tecla **Escape** cierra el panel si está abierto.
- Click en el **backdrop** cierra el panel.
- **Scroll lock** del `body` mientras el panel está abierto.
- `calibreMm` es opcional (piedras "en bruto" del Catálogo no lo tienen): la línea del carrito muestra `(Xmm)` solo si el valor existe, igual que ya hace la tarjeta del Catálogo.

## Testing

- Se agrega `pedido.service.spec.ts` (Vitest) cubriendo: agregar un ítem nuevo, incrementar cantidad de un ítem existente, quitar un ítem, cálculo de `totalPedido` y `cantidadItems`.
- No se agregan tests de componente para `PanelPedido` ni para el toggle del Header — fuera del alcance actual del proyecto (solo existe `app.spec.ts` como test de componente hoy).

## Fuera de alcance

- No hay checkout ni cobro en la página (se mantiene el flujo actual de "confirmar por WhatsApp").
- No se persiste el carrito en `localStorage` (se pierde al recargar la página, igual que hoy).
- No se rediseña visualmente el contenido del pedido más allá de adaptarlo al formato de panel lateral (colores/tipografía siguen los tokens globales ya definidos en `styles.scss`).
