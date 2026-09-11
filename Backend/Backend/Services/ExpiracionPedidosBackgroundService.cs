using TiendaApi.Services.Interfaces;

namespace TiendaApi.Services;

/// <summary>
/// Revisa periódicamente los pedidos pendientes vencidos, los pasa a
/// <c>Expirado</c> y libera su reserva de stock. Sin esto, un pedido de WhatsApp
/// que nunca se responde deja stock bloqueado para siempre.
/// </summary>
public class ExpiracionPedidosBackgroundService : BackgroundService
{
    private const int IntervaloPorDefectoSegundos = 900; // 15 min
    private const int IntervaloMinimoSegundos = 5;        // piso de seguridad

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ExpiracionPedidosBackgroundService> _logger;
    private readonly TimeSpan _intervalo;

    public ExpiracionPedidosBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<ExpiracionPedidosBackgroundService> logger,
        IConfiguration configuration)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        var segundos = configuration.GetValue<int?>("Pedidos:ExpiracionIntervaloSegundos")
                       ?? IntervaloPorDefectoSegundos;
        _intervalo = TimeSpan.FromSeconds(Math.Max(segundos, IntervaloMinimoSegundos));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Expiración de pedidos activa. Intervalo: {Intervalo}.", _intervalo);

        using var timer = new PeriodicTimer(_intervalo);

        do
        {
            await ProcesarAsync(stoppingToken);
        }
        while (await EsperarSiguienteTickAsync(timer, stoppingToken));
    }

    private async Task ProcesarAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var servicio = scope.ServiceProvider.GetRequiredService<IPedidoService>();

            var expirados = await servicio.ExpirarVencidosAsync();
            if (expirados > 0)
                _logger.LogInformation("Se expiraron {Cantidad} pedidos pendientes vencidos.", expirados);
        }
        catch (Exception ex)
        {
            // Un error en una corrida no debe tumbar el servicio: se reintenta en el próximo tick.
            _logger.LogError(ex, "Fallo al expirar pedidos pendientes vencidos.");
        }
    }

    private static async Task<bool> EsperarSiguienteTickAsync(PeriodicTimer timer, CancellationToken stoppingToken)
    {
        try
        {
            return await timer.WaitForNextTickAsync(stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }
}
