using TiendaApi.Models;

namespace TiendaApi.Services.Interfaces;

public record PreferenciaCreada(string PreferenceId, string InitPoint);

public interface IMercadoPagoService
{
    Task<PreferenciaCreada> CrearPreferenciaAsync(Pedido pedido);
}
