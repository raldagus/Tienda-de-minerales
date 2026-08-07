using TiendaApi.DTOs;
using TiendaApi.Models;
using TiendaApi.Repositories.Interfaces;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Services;

public class MovimientoService : IMovimientoService
{
    private readonly IMovimientoRepository _repo;
    private readonly IProductoRepository _productoRepo;


    public MovimientoService(IMovimientoRepository repo, IProductoRepository productoRepo)
    {
        _repo = repo;
        _productoRepo = productoRepo;
    }

    public async Task<IEnumerable<MovimientoResponseDto>> ObtenerTodosAsync(int? idProducto = null)
    {
        var movimientos = await _repo.ObtenerTodosAsync(idProducto);
        return movimientos.Select(ToDto);
    }

    public async Task<MovimientoResponseDto?> ObtenerPorIdAsync(int id)
    {
        var movimiento = await _repo.ObtenerPorIdAsync(id);
        return movimiento is null ? null : ToDto(movimiento);
    }

  

    private static MovimientoResponseDto ToDto(MovimientoStock m) =>
        new(m.IdMovimiento, m.IdProducto, m.Producto.Nombre,
            m.TipoMovimiento, m.Cantidad, m.PrecioUnitario,
            m.Motivo, m.FechaMovimiento);
}
