using TiendaApi.DTOs;

namespace TiendaApi.Services.Interfaces;

public interface IPedidoService
{
    Task<PedidoCreadoDto> CrearAsync(CrearPedidoDto dto);
    Task<PedidoResponseDto?> ObtenerPorIdAsync(int id);
}
