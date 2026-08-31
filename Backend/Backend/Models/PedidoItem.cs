namespace TiendaApi.Models;

public class PedidoItem
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public string NombreProducto { get; set; } = string.Empty;

    // Navegación
    public Pedido Pedido { get; set; } = null!;
    public Producto Producto { get; set; } = null!;
}
