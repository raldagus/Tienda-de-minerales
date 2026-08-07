using TiendaApi.Models;

namespace TiendaApi.Repositories.Interfaces;

public interface IProductoRepository
{
    Task<IEnumerable<Producto>> ObtenerTodosAsync(int? idCategoria = null);
    Task<Producto?> ObtenerPorIdAsync(int id);
    Task<Producto> AgregarAsync(Producto producto);
    Task<Producto> ModificarAsync(Producto producto);
    Task<Producto?> ActualizarImagenAsync(int idProducto, string? imagenUrl);
    Task<bool> EliminarAsync(int id);
}
