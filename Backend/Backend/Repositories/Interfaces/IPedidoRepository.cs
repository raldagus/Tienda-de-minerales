using TiendaApi.Models;

namespace TiendaApi.Repositories.Interfaces;

public interface IPedidoRepository
{
    Task<Pedido> AgregarAsync(Pedido pedido);
    Task<Pedido?> ObtenerPorIdAsync(int id);
    Task<List<Pedido>> ListarAsync(EstadoPedido? estado);
    Task<List<Pedido>> ListarPendientesVencidosAsync(DateTime limite);
    Task ActualizarPreferenceIdAsync(int pedidoId, string preferenceId);
}
