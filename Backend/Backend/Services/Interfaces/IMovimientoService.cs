using TiendaApi.DTOs;

namespace TiendaApi.Services.Interfaces;

public interface IMovimientoService
{
    Task<IEnumerable<MovimientoResponseDto>> ObtenerTodosAsync(int? idProducto = null);
    Task<MovimientoResponseDto?> ObtenerPorIdAsync(int id);
}
