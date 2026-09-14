using Microsoft.Extensions.Configuration;
using TiendaApi.DTOs;
using TiendaApi.Services;
using Xunit;

namespace Backend.Tests.Services;

public class AuthServiceTests
{
    private const string ClaveDePrueba = "clave-de-firma-de-prueba-bien-larga-1234567890";

    private static IConfiguration CrearConfig(string usuario, string passwordHasheada, string? jwtKey = ClaveDePrueba)
    {
        var valores = new Dictionary<string, string?>
        {
            ["Auth:Usuario"] = usuario,
            ["Auth:PasswordHash"] = passwordHasheada,
            ["Jwt:Key"] = jwtKey,
            ["Jwt:Issuer"] = "TiendaMineraApi",
            ["Jwt:Audience"] = "TiendaMineraAdmin",
        };
        return new ConfigurationBuilder().AddInMemoryCollection(valores).Build();
    }

    [Fact]
    public void Login_con_credenciales_correctas_devuelve_un_token_valido_hasta_su_expiracion()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Secreta123!");
        var servicio = new AuthService(CrearConfig("admin", hash));

        var resultado = servicio.Login(new LoginDto("admin", "Secreta123!"));

        Assert.NotNull(resultado);
        Assert.False(string.IsNullOrWhiteSpace(resultado!.Token));
        Assert.True(resultado.ExpiraEn > DateTime.UtcNow);
    }

    [Fact]
    public void Login_con_usuario_incorrecto_devuelve_null()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Secreta123!");
        var servicio = new AuthService(CrearConfig("admin", hash));

        var resultado = servicio.Login(new LoginDto("otro-usuario", "Secreta123!"));

        Assert.Null(resultado);
    }

    [Fact]
    public void Login_con_password_incorrecta_devuelve_null()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Secreta123!");
        var servicio = new AuthService(CrearConfig("admin", hash));

        var resultado = servicio.Login(new LoginDto("admin", "otra-clave"));

        Assert.Null(resultado);
    }

    [Fact]
    public void Login_sin_Auth_Usuario_configurado_lanza_excepcion()
    {
        var servicio = new AuthService(CrearConfig(usuario: null!, passwordHasheada: BCrypt.Net.BCrypt.HashPassword("x")));

        Assert.Throws<InvalidOperationException>(() => servicio.Login(new LoginDto("admin", "x")));
    }

    [Fact]
    public void Login_sin_Jwt_Key_configurado_lanza_excepcion()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Secreta123!");
        var servicio = new AuthService(CrearConfig("admin", hash, jwtKey: null));

        Assert.Throws<InvalidOperationException>(() => servicio.Login(new LoginDto("admin", "Secreta123!")));
    }
}
