namespace TiendaApi.Models;

public class MovimientoStock
{
    public int IdMovimiento { get; set; }
    public int IdProducto { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty; // "Entrada" | "Salida" | "Ajuste"
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public string? Motivo { get; set; }
    public DateTime FechaMovimiento { get; set; } = DateTime.UtcNow;

    // Navegación
    public Producto Producto { get; set; } = null!;
}
