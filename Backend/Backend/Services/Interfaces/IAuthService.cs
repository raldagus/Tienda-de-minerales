using TiendaApi.DTOs;

namespace TiendaApi.Services.Interfaces;

public interface IAuthService
{
    /// <summary>Valida las credenciales contra Auth:Usuario / Auth:PasswordHash y devuelve un JWT. Null si no coinciden.</summary>
    LoginResponseDto? Login(LoginDto dto);
}
