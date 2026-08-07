namespace TiendaApi.Models;

public class Categoria
{
    public int IdCategoria { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Eliminado { get; set; } = false;
    public DateTime? FechaEliminado { get; set; }

    // Navegación
    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}
