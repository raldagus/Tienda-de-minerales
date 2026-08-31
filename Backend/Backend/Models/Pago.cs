namespace TiendaApi.Models;

public class Pago
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public string PaymentIdExterno { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty; // status crudo de Mercado Pago: approved | rejected | pending
    public decimal Monto { get; set; }
    public string? MetodoPago { get; set; }
    public string PayloadCrudo { get; set; } = string.Empty;

    // Navegación
    public Pedido Pedido { get; set; } = null!;
}
