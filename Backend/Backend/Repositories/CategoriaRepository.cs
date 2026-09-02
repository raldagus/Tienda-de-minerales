using Microsoft.EntityFrameworkCore;
using TiendaApi.Data;
using TiendaApi.Models;
using TiendaApi.Repositories.Interfaces;

namespace TiendaApi.Repositories;

public class CategoriaRepository : ICategoriaRepository
{
    private readonly TiendaDbContext _context;

    public CategoriaRepository(TiendaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Categoria>> ObtenerTodosAsync()
        => await _context.Categorias
            .Where(c => !c.Eliminado)
            .OrderBy(c => c.Nombre)
            .ToListAsync();

    public async Task<Categoria?> ObtenerPorIdAsync(int id)
        => await _context.Categorias
            .FirstOrDefaultAsync(c => c.IdCategoria == id && !c.Eliminado);

    public async Task<Categoria> AgregarAsync(Categoria categoria)
    {
        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();
        return categoria;
    }

    public async Task<Categoria> ModificarAsync(Categoria categoria)
    {
        _context.Categorias.Update(categoria);
        await _context.SaveChangesAsync();
        return categoria;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var categoria = await ObtenerPorIdAsync(id);
        if (categoria is null) return false;

        categoria.Eliminado = true;
        categoria.FechaEliminado = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExisteNombreAsync(string nombre, int? idExcluir = null)
        => await _context.Categorias
            .AnyAsync(c => c.Nombre == nombre && !c.Eliminado &&
                           (idExcluir == null || c.IdCategoria != idExcluir));

    public async Task<bool> TieneProductosActivosAsync(int id)
        => await _context.Productos
            .AnyAsync(p => p.IdCategoria == id && !p.Eliminado);
}
