using TiendaApi.Models;

namespace TiendaApi.Repositories.Interfaces;

public interface IPedidoRepository
{
    Task<Pedido> AgregarAsync(Pedido pedido);
    Task<Pedido?> ObtenerPorIdAsync(int id);
    Task ActualizarPreferenceIdAsync(int pedidoId, string preferenceId);
}
