using Microsoft.AspNetCore.Mvc;
using TiendaApi.DTOs;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MovimientosController : ControllerBase
{
    private readonly IMovimientoService _service;

    public MovimientosController(IMovimientoService service)
    {
        _service = service;
    }

    /// <summary>Obtiene el historial de movimientos. Filtro opcional por producto.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MovimientoResponseDto>>> ObtenerTodos(
        [FromQuery] int? idProducto = null)
    {
        var movimientos = await _service.ObtenerTodosAsync(idProducto);
        return Ok(movimientos);
    }

    /// <summary>Obtiene un movimiento por su ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<MovimientoResponseDto>> ObtenerPorId(int id)
    {
        var movimiento = await _service.ObtenerPorIdAsync(id);
        return movimiento is null ? NotFound() : Ok(movimiento);
    }

}
