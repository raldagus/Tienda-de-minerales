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
