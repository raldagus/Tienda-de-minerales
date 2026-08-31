namespace TiendaApi.Models;

public class Pedido
{
    public int Id { get; set; }
    public string NombreComprador { get; set; } = string.Empty;
    public string EmailComprador { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? DireccionEnvio { get; set; }
    public decimal Total { get; set; }
    public EstadoPedido Estado { get; set; } = EstadoPedido.PendientePago;
    public string? PreferenceId { get; set; }
    public DateTime? PagadoEn { get; set; }

    // Navegación
    public ICollection<PedidoItem> Items { get; set; } = new List<PedidoItem>();
    public ICollection<Pago> Pagos { get; set; } = new List<Pago>();
}
