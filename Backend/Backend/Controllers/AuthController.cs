using Microsoft.AspNetCore.Mvc;
using TiendaApi.DTOs;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;

    public AuthController(IAuthService service)
    {
        _service = service;
    }

    /// <summary>Valida usuario y contraseña del dueño de la tienda y devuelve un JWT para el panel de admin.</summary>
    [HttpPost("login")]
    public ActionResult<LoginResponseDto> Login(LoginDto dto)
    {
        var resultado = _service.Login(dto);
        return resultado is null ? Unauthorized(new { mensaje = "Usuario o contraseña incorrectos." }) : Ok(resultado);
    }
}
