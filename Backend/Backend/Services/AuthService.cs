using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TiendaApi.DTOs;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Services;

public class AuthService : IAuthService
{
    private const int ExpiracionMinutosPorDefecto = 480; // 8 horas

    private readonly IConfiguration _config;

    public AuthService(IConfiguration config)
    {
        _config = config;
    }

    public LoginResponseDto? Login(LoginDto dto)
    {
        var usuario = _config["Auth:Usuario"];
        var passwordHash = _config["Auth:PasswordHash"];
        if (string.IsNullOrWhiteSpace(usuario) || string.IsNullOrWhiteSpace(passwordHash))
            throw new InvalidOperationException("Falta configurar Auth:Usuario y Auth:PasswordHash en User Secrets.");

        if (dto.Usuario != usuario || !BCrypt.Net.BCrypt.Verify(dto.Password, passwordHash))
            return null;

        return GenerarToken(usuario);
    }

    private LoginResponseDto GenerarToken(string usuario)
    {
        var key = _config["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("Falta configurar Jwt:Key en User Secrets.");

        var issuer = _config["Jwt:Issuer"] ?? "TiendaMineraApi";
        var audience = _config["Jwt:Audience"] ?? "TiendaMineraAdmin";
        var minutos = _config.GetValue<int?>("Jwt:ExpiracionMinutos") ?? ExpiracionMinutosPorDefecto;
        var expiraEn = DateTime.UtcNow.AddMinutes(minutos);

        var credenciales = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: new[] { new Claim(ClaimTypes.Name, usuario) },
            expires: expiraEn,
            signingCredentials: credenciales);

        return new LoginResponseDto(new JwtSecurityTokenHandler().WriteToken(token), expiraEn);
    }
}
