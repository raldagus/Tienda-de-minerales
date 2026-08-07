namespace TiendaApi.Models;

public class Producto
{
    public int IdProducto { get; set; }
    public int IdCategoria { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Codigo { get; set; }
    public decimal PrecioUnitario { get; set; }
    public int Stock { get; set; } = 0;
    public int? CalibreMn { get; set; }
    public bool Eliminado { get; set; } = false;
    public DateTime? FechaEliminado { get; set; }
    public string? ImagenUrl { get; set; }

    // Navegación
    public Categoria Categoria { get; set; } = null!;
    public ICollection<MovimientoStock> Movimientos { get; set; } = new List<MovimientoStock>();
}
