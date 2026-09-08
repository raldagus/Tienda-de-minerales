using TiendaApi.DTOs;
using TiendaApi.Models;

namespace TiendaApi.Services.Interfaces;

public interface IPedidoService
{
    Task<PedidoCreadoDto> CrearAsync(CrearPedidoDto dto);
    Task<PedidoResponseDto?> ObtenerPorIdAsync(int id);
    Task<IEnumerable<PedidoResponseDto>> ListarAsync(EstadoPedido? estado);
    Task<PedidoResponseDto?> ConfirmarAsync(int id);
    Task<PedidoResponseDto?> CancelarAsync(int id);
}
