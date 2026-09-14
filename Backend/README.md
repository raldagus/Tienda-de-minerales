# Backend — TiendaApi

API ASP.NET Core (.NET 9) + EF Core + PostgreSQL.

## Configuración

`Backend/Backend/appsettings.Development.json` no se versiona (contiene ajustes locales y, a futuro, credenciales como el Access Token de Mercado Pago). Para armar tu entorno local, parado en la raíz del repo:

```bash
cp Backend/Backend/appsettings.Development.example.json Backend/Backend/appsettings.Development.json
```

Completá los valores que falten en el archivo copiado.

La cadena de conexión a PostgreSQL (`ConnectionStrings:DefaultConnection`) no va en `appsettings`, se guarda con User Secrets. Parado en `Backend/Backend` (donde está el `.csproj`):

```bash
cd Backend/Backend
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=127.0.0.1;Port=5432;Database=tienda_minera;Username=...;Password=..."
```

El Access Token de Mercado Pago (`MercadoPago:AccessToken`) sigue el mismo patrón — es un secreto, no va en `appsettings`:

```bash
cd Backend/Backend
dotnet user-secrets set "MercadoPago:AccessToken" "TEST-..."
```

`MercadoPago:NotificationUrl` y `MercadoPago:FrontendUrl` no son secretos, van en `appsettings.Development.json`.

### Autenticación del panel de admin

El panel usa JWT simple (sin ASP.NET Identity ni tabla de usuarios): un único usuario y contraseña, guardados en User Secrets. El hash de la contraseña se genera con BCrypt — nunca se guarda en texto plano.

Generar el hash (parado en `Backend/Backend`, con el proyecto ya restaurado):

```bash
cd Backend/Backend
dotnet run -- hash-password "TuContraseñaSegura"
```

Ese comando imprime el hash BCrypt y termina sin levantar el servidor. Copiá la salida:

```bash
dotnet user-secrets set "Auth:Usuario" "admin"
dotnet user-secrets set "Auth:PasswordHash" "$2a$11$..."
```

La clave de firma del JWT (`Jwt:Key`) también es secreta — usá una cadena larga y aleatoria (32+ caracteres):

```bash
dotnet user-secrets set "Jwt:Key" "una-clave-larga-y-aleatoria-de-al-menos-32-caracteres"
```

`Jwt:Issuer`, `Jwt:Audience` y `Jwt:ExpiracionMinutos` no son secretos, van en `appsettings.Development.json`.

Sin `Auth:Usuario`/`Auth:PasswordHash`/`Jwt:Key` configurados, `POST /api/auth/login` (o el arranque de la app, en el caso de `Jwt:Key`) falla con un error explícito.

Endpoints protegidos con `[Authorize]`: `GET /api/pedidos` (listado del panel), `POST /api/pedidos/{id}/confirmar` y `POST /api/pedidos/{id}/cancelar`. El catálogo y `POST /api/pedidos` (creación desde el carrito del cliente) quedan públicos.
