using MercadoPago.Client.Preference;
using MercadoPago.Error;
using TiendaApi.Exceptions;
using TiendaApi.Models;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Services;

public class MercadoPagoService : IMercadoPagoService
{
    private readonly IConfiguration _config;

    public MercadoPagoService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<PreferenciaCreada> CrearPreferenciaAsync(Pedido pedido)
    {
        var accessToken = _config["MercadoPago:AccessToken"];
        if (string.IsNullOrWhiteSpace(accessToken))
            throw new MercadoPagoNoDisponibleException(
                "Mercado Pago no esta configurado: falta MercadoPago:AccessToken.");

        var frontendUrl = _config["MercadoPago:FrontendUrl"]
            ?? throw new InvalidOperationException("Falta configurar MercadoPago:FrontendUrl.");
        var notificationUrl = _config["MercadoPago:NotificationUrl"]
            ?? throw new InvalidOperationException("Falta configurar MercadoPago:NotificationUrl.");

        var request = new PreferenceRequest
        {
            Items = pedido.Items.Select(i => new PreferenceItemRequest
            {
                Title = i.NombreProducto,
                Quantity = i.Cantidad,
                CurrencyId = "ARS",
                UnitPrice = i.PrecioUnitario
            }).ToList(),
            Payer = new PreferencePayerRequest
            {
                Name = pedido.NombreComprador,
                Email = pedido.EmailComprador
            },
            ExternalReference = pedido.Id.ToString(),
            NotificationUrl = notificationUrl,
            BackUrls = new PreferenceBackUrlsRequest
            {
                Success = $"{frontendUrl}/pedido/{pedido.Id}/exito",
                Failure = $"{frontendUrl}/pedido/{pedido.Id}/error",
                Pending = $"{frontendUrl}/pedido/{pedido.Id}/pendiente"
            },
            AutoReturn = "approved"
        };

        try
        {
            var client = new PreferenceClient();
            var preferencia = await client.CreateAsync(request);
            return new PreferenciaCreada(preferencia.Id, preferencia.InitPoint);
        }
        catch (MercadoPagoApiException ex)
        {
            throw new MercadoPagoNoDisponibleException(
                "Mercado Pago rechazo la solicitud. Verifica que el Access Token configurado sea valido.", ex);
        }
    }
}
