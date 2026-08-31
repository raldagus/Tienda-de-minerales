# Plan de implementación — Mercado Pago Checkout Pro

Documento de referencia para implementar pagos en Tienda de Minerales.

**Stack:** ASP.NET Core (.NET 9) + EF Core + PostgreSQL (`TiendaApi`) / Angular 17+ standalone con SSR y signals.

**Cómo usar este archivo:** cada fase se ejecuta por separado. Al empezar una fase, indicar:
`leé docs/mercadopago-plan.md y ejecutá la Fase N`.

## Reglas que aplican a todas las fases

- Seguir las convenciones que ya existen en el proyecto: POCOs sin data annotations, `IEntityTypeConfiguration<T>` para la configuración de EF, `numeric(12,2)` para decimales, timestamps vía `AplicarMarcasDeTiempo()`.
- **No** aplicar soft-delete (`Eliminado`/`FechaEliminado`) ni `HasQueryFilter` a las entidades de pedidos y pagos. Los pedidos no se borran, se cancelan cambiando el estado.
- Mostrar los cambios archivo por archivo con una explicación breve. No reemplazar archivos completos si alcanza con editarlos.
- No ejecutar `dotnet ef database update` sin avisar: primero se revisa el archivo de migración.
- Entorno: PowerShell 5.1 en Windows.
- Un commit por fase, formato Conventional Commits.

## Decisiones de arquitectura ya tomadas

Estas no se rediscuten al implementar:

1. **Checkout Pro con redirección**, no Bricks. Menos superficie de error y sin responsabilidad sobre datos de tarjeta.
2. **El pedido se persiste en PostgreSQL antes de redirigir a pagar.** Sin fila en la base no hay dónde asentar el resultado del webhook.
3. **Los precios se recalculan siempre en el backend.** El frontend manda solo `productoId` y `cantidad`, nunca importes.
4. **El webhook es la única confirmación válida de pago.** La `back_url` es solo experiencia de usuario y no debe cambiar el estado del pedido.
5. **`PrecioUnitario` y `NombreProducto` se congelan en `PedidoItem`** al momento de la compra. Si el precio del producto cambia después, el histórico no se mueve.
6. **Un `Pedido` puede tener varios `Pago`.** Mercado Pago permite reintentos: un rechazo seguido de una aprobación sobre la misma preferencia.
7. **La idempotencia del webhook se garantiza en la base**, con índice único sobre `Pago.PaymentIdExterno`.

---

## Fase 0 — Preparación (sin código)

Fuera del repo, antes de arrancar:

- Crear la aplicación en el panel de Mercado Pago Developers y copiar las credenciales de **test** (Access Token y Public Key).
- Crear las cuentas de prueba de vendedor y comprador.
- Instalar ngrok o habilitar Dev Tunnels de VS Code, y verificar que exponen la API local.
- **Resolver el stock real.** Mientras los productos tengan `stock: 1` de placeholder no se puede validar disponibilidad en el checkout. Definir si va un campo `Stock` verdadero o un flag `ControlaStock` para los productos que no lo llevan.

---

## Fase 1 — Entidades y migración

Solo dominio y migración. No se toca el SDK de Mercado Pago ni ningún controller.

### Entidades

**`EstadoPedido`** (enum): `PendientePago`, `Pagado`, `Rechazado`, `Cancelado`, `Enviado`.

**`Pedido`**
- `Id`
- `NombreComprador`, `EmailComprador`
- `Telefono` (opcional), `DireccionEnvio` (opcional)
- `Total`
- `Estado` (`EstadoPedido`, default `PendientePago`)
- `PreferenceId` (string nullable) — id de preferencia de Mercado Pago
- `PagadoEn` (DateTime nullable)
- Colecciones: `Items`, `Pagos`

**`PedidoItem`**
- `Id`
- `PedidoId` + navegación
- `ProductoId` + navegación
- `Cantidad`
- `PrecioUnitario`, `NombreProducto` — congelados al momento de la compra

**`Pago`**
- `Id`
- `PedidoId` + navegación
- `PaymentIdExterno` (string) — el id que devuelve Mercado Pago
- `Estado` (string) — el status crudo de MP: `approved`, `rejected`, `pending`
- `Monto`
- `MetodoPago` (string nullable)
- `PayloadCrudo` (string, sin límite de largo) — JSON completo de la notificación, para auditar

### Configuración EF

- `numeric(12,2)` para `Total`, `PrecioUnitario` y `Monto`.
- Índices: `Pedido.PreferenceId`, `Pedido.Estado`, y `Pago.PaymentIdExterno` **único**.
- `PedidoItem` → `Pedido`: `Cascade`.
- `Pago` → `Pedido`: `Cascade`.
- `PedidoItem` → `Producto`: `Restrict`. Borrar un producto no debe borrar el historial de ventas.
- Largos máximos razonables en los strings, salvo `PayloadCrudo`.

### Cierre

Migración: `dotnet ef migrations add AddPedidoPedidoItemPago`. Revisar el archivo generado antes de aplicarlo.

**Verificación:** las tres tablas existen en Postgres con las columnas, tipos e índices correctos.

**Commit:** `feat(pedidos): agregar entidades Pedido, PedidoItem y Pago con migracion`

---

## Fase 2 — Endpoint de pedido, sin Mercado Pago todavía

### DTOs

```
CrearPedidoItemDto  → ProductoId, Cantidad
CrearPedidoDto      → Nombre, Email, Telefono?, Direccion?, Items[]
PedidoCreadoDto     → PedidoId
```

El request **no incluye precios**.

### `POST /api/pedidos`

1. Rechazar el pedido si viene sin items.
2. Traer los productos de la base por sus IDs.
3. Por cada item: validar que el producto exista, que la cantidad sea ≥ 1 y que haya stock suficiente.
4. Armar los `PedidoItem` tomando `PrecioUnitario` y `NombreProducto` **de la entidad `Producto` de la base**, no del request.
5. Calcular `Total` sumando los items.
6. Guardar en estado `PendientePago`.
7. Devolver el `PedidoId`.

### `GET /api/pedidos/{id}`

Devuelve estado, total e items. Se usa en la Fase 6 para las páginas de resultado.

**Verificación:** con curl o un archivo `.http`, crear un pedido y confirmar que la fila queda bien, que el total lo calculó el backend, y que rechaza cantidades inválidas, productos inexistentes y falta de stock.

**Commit:** `feat(api): endpoint de creacion de pedidos con validacion de stock`

> Esta fase tiene valor por sí sola: aunque el proyecto nunca siga con Mercado Pago, ya reemplaza los mensajes sueltos de WhatsApp por pedidos trazables en la base.

---

## Fase 3 — SDK y creación de la preferencia

### Configuración

```
dotnet add package mercadopago-sdk
```

El `AccessToken` es un secreto: va en User Secrets, mismo patrón que `ConnectionStrings:DefaultConnection`. Parado en `Backend/Backend`:

```bash
dotnet user-secrets set "MercadoPago:AccessToken" "TEST-..."
```

`NotificationUrl` y `FrontendUrl` no son secretos (son URLs de configuración local, no credenciales), así que van en `appsettings.Development.json` — y de paso en `appsettings.Development.example.json` con placeholders, para que quede documentado qué hay que completar:

```json
{
  "MercadoPago": {
    "NotificationUrl": "https://tu-ngrok.ngrok-free.app/api/pagos/webhook",
    "FrontendUrl": "http://localhost:4200"
  }
}
```

En `Program.cs`: leer `MercadoPago:AccessToken` de la configuración (la combina automáticamente con User Secrets en Development) para setear `MercadoPagoConfig.AccessToken`, y registrar el servicio.

**El Access Token vive solo en el backend.** Nunca en Angular.

### `IMercadoPagoService` / `MercadoPagoService`

Método `CrearPreferenciaAsync(Pedido pedido)` que devuelve el `InitPoint`:

- `Items`: mapeados desde `pedido.Items`, con `CurrencyId = "ARS"`.
- `Payer`: nombre y email del comprador.
- `ExternalReference = pedido.Id.ToString()` — así el webhook resuelve a qué pedido corresponde el pago.
- `NotificationUrl`: desde configuración.
- `BackUrls`: `success`, `failure` y `pending` apuntando a `{FrontendUrl}/pedido/{id}/...`.
- `AutoReturn = "approved"`.

### Cambio en el endpoint

Después del primer `SaveChangesAsync` (necesario para tener el `Id`), crear la preferencia, guardar el `PreferenceId` en el pedido con un segundo `SaveChangesAsync`, y devolver `PedidoCreadoDto` ampliado con `InitPoint`.

**Verificación:** el endpoint devuelve una URL de `mercadopago.com.ar`. Abrirla en el navegador y confirmar que aparecen los productos correctos y el total correcto.

**Commit:** `feat(pagos): integrar SDK de Mercado Pago y creacion de preferencias`

---

## Fase 4 — Webhook

La parte que realmente confirma el pago. Es la fase más delicada de todo el plan.

### `POST /api/pagos/webhook`

Endpoint **anónimo** — Mercado Pago no manda ningún token propio.

Lógica:

1. Leer `type` y `data.id` del query string. Si `type != "payment"`, responder `200` y salir.
2. Guardar el payload crudo antes de procesar nada.
3. **Consultar el pago contra la API de Mercado Pago** usando `PaymentClient().GetAsync(id)`. Nunca confiar en el contenido del body de la notificación.
4. Resolver el pedido por `ExternalReference`.
5. Si ya existe un `Pago` con ese `PaymentIdExterno`, responder `200` y salir sin hacer nada.
6. Crear el registro de `Pago` con el estado crudo que devolvió MP.
7. Si el status es `approved`: pasar el pedido a `Pagado`, setear `PagadoEn`, descontar stock y registrar un `MovimientoStock` por cada item con motivo `"Venta - pedido #{id}"`.
8. Si es `rejected` o `cancelled`: pasar el pedido a `Rechazado` sin tocar el stock.
9. Si es `pending` o `in_process`: dejar el pedido como está. Es el caso del pago en efectivo por Rapipago, que puede tardar días en acreditar.

### Reglas no negociables

- **Responder `200` siempre**, incluso cuando se ignora el evento. Un error hace que MP reintente durante horas.
- **Idempotencia**: MP puede mandar la misma notificación varias veces. El índice único sobre `PaymentIdExterno` es la última línea de defensa, pero la comprobación explícita del paso 5 evita llegar a la excepción.
- El descuento de stock y el cambio de estado van en la misma transacción.

**Verificación:** levantar ngrok, poner la URL en `NotificationUrl` y hacer una compra completa con tarjeta de prueba. Usar `APRO` como nombre del titular para que apruebe y confirmar que el pedido pasa a `Pagado` y el stock baja. Repetir con `OTHE` y confirmar que queda en `Rechazado` sin tocar el stock. Reenviar manualmente la misma notificación y confirmar que no descuenta stock dos veces.

**Commit:** `feat(pagos): webhook de notificaciones con idempotencia y descuento de stock`

---

## Fase 5 — Checkout en Angular

### `PedidoService`

Método `crearPedidoConPago(datos)` que hace `POST` a `/api/pedidos` mandando solo:

```
{ nombre, email, telefono, direccion, items: [{ productoId, cantidad }] }
```

### Componente de checkout

Formulario con nombre, email, teléfono y dirección. Al enviar:

1. Poner el estado en "procesando".
2. Llamar al servicio.
3. En caso de éxito: vaciar el carrito **y recién después** redirigir con `window.location.href = res.initPoint`.
4. En caso de error: mostrar el mensaje del backend y liberar el botón.

**Cuidado con SSR:** la redirección solo corre en el navegador. Envolver en un chequeo de `isPlatformBrowser`.

Rutas nuevas en `app.routes.ts`.

**Verificación:** flujo completo desde el catálogo hasta la pantalla de Mercado Pago.

**Commit:** `feat(checkout): formulario de compra con redireccion a Mercado Pago`

---

## Fase 6 — Páginas de resultado

Rutas `pedido/:id/exito`, `pedido/:id/error`, `pedido/:id/pendiente`.

Consultan `GET /api/pedidos/{id}` y muestran el **estado real de la base**, no lo que dice la URL.

Detalle importante: el webhook puede llegar unos segundos después de que el usuario vuelve del checkout. La página de éxito debe reintentar la consulta un par de veces con delay antes de dar el pago por confirmado, y mostrar un estado intermedio de "confirmando pago" mientras tanto. **Nunca mostrar "pagado" solo porque la ruta es `/exito`.**

**Commit:** `feat(checkout): paginas de resultado de pago`

---

## Fase 7 — Endurecimiento

Para después de que el flujo completo funcione de punta a punta:

- Validar la firma `x-signature` del webhook.
- Job que cancele pedidos en `PendientePago` con más de X horas y libere el stock reservado.
- Listado de pedidos para administración, con endpoint protegido.
- Email de confirmación al comprador.
- `RowVersion` para manejo de concurrencia sobre `Producto.Stock`.
- Migrar a credenciales de producción y apuntar la `NotificationUrl` al dominio real.

---

## Datos de prueba de Mercado Pago

Tarjeta Mastercard de test: `5031 7557 3453 0604`, cualquier CVV, vencimiento futuro.

El nombre del titular define el resultado de la simulación:

| Titular | Resultado |
|---|---|
| `APRO` | Aprobado |
| `OTHE` | Rechazado por error general |
| `CONT` | Pendiente |
| `FUND` | Rechazado por fondos insuficientes |
