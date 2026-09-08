using Microsoft.AspNetCore.Mvc;
using TiendaApi.DTOs;
using TiendaApi.Models;
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

    /// <summary>Lista pedidos para el panel de administración, con filtro opcional por estado.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PedidoResponseDto>>> Listar([FromQuery] EstadoPedido? estado = null)
    {
        var pedidos = await _service.ListarAsync(estado);
        return Ok(pedidos);
    }

    /// <summary>Confirma un pedido pendiente: descuenta el stock físico y libera la reserva.</summary>
    [HttpPost("{id:int}/confirmar")]
    public async Task<ActionResult<PedidoResponseDto>> Confirmar(int id)
    {
        try
        {
            var resultado = await _service.ConfirmarAsync(id);
            return resultado is null ? NotFound() : Ok(resultado);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }

    /// <summary>Cancela un pedido pendiente y libera la reserva de stock.</summary>
    [HttpPost("{id:int}/cancelar")]
    public async Task<ActionResult<PedidoResponseDto>> Cancelar(int id)
    {
        try
        {
            var resultado = await _service.CancelarAsync(id);
            return resultado is null ? NotFound() : Ok(resultado);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }
}
