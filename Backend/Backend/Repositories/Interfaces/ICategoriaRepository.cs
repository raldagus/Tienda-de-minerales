using TiendaApi.Models;

namespace TiendaApi.Repositories.Interfaces;

public interface ICategoriaRepository
{
    Task<IEnumerable<Categoria>> ObtenerTodosAsync();
    Task<Categoria?> ObtenerPorIdAsync(int id);
    Task<Categoria> AgregarAsync(Categoria categoria);
    Task<Categoria> ModificarAsync(Categoria categoria);
    Task<bool> EliminarAsync(int id);
    Task<bool> ExisteNombreAsync(string nombre, int? idExcluir = null);
    Task<bool> TieneProductosActivosAsync(int id);
}
