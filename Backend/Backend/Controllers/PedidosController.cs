using Microsoft.AspNetCore.Mvc;
using TiendaApi.DTOs;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class PedidosController : ControllerBase
{
    private readonly IPedidoService _service;

    public PedidosController(IPedidoService service)
    {
        _service = service;
    }

    /// <summary>Crea un pedido a partir del carrito. Los precios se calculan siempre en el backend.</summary>
    [HttpPost]
    public async Task<ActionResult<PedidoCreadoDto>> Crear(CrearPedidoDto dto)
    {
        try
        {
            var resultado = await _service.CrearAsync(dto);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.PedidoId }, resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    /// <summary>Obtiene un pedido por su ID: estado, total e items.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PedidoResponseDto>> ObtenerPorId(int id)
    {
        var pedido = await _service.ObtenerPorIdAsync(id);
        return pedido is null ? NotFound() : Ok(pedido);
    }
}
