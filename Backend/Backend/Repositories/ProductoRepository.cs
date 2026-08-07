using Microsoft.EntityFrameworkCore;
using TiendaApi.Data;
using TiendaApi.Models;
using TiendaApi.Repositories.Interfaces;

namespace TiendaApi.Repositories;

public class ProductoRepository : IProductoRepository
{
    private readonly TiendaDbContext _context;

    public ProductoRepository(TiendaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Producto>> ObtenerTodosAsync(int? idCategoria = null)
        => await _context.Productos
            .Include(p => p.Categoria)
            .Where(p => !p.Eliminado &&
                        (idCategoria == null || p.IdCategoria == idCategoria))
            .OrderBy(p => p.Nombre)
            .ToListAsync();

    public async Task<Producto?> ObtenerPorIdAsync(int id)
        => await _context.Productos
            .Include(p => p.Categoria)
            .FirstOrDefaultAsync(p => p.IdProducto == id && !p.Eliminado);

    public async Task<Producto> AgregarAsync(Producto producto)
    {
        _context.Productos.Add(producto);
        _context.MovimientosStock.Add(new MovimientoStock
        {
            Producto = producto,
            TipoMovimiento = "Entrada",
            Cantidad = producto.Stock,
            PrecioUnitario = producto.PrecioUnitario,
            Motivo = "Alta de producto"
        });
        await _context.SaveChangesAsync();
        return producto;
    }

    public async Task<Producto> ModificarAsync(Producto producto)
    {
        var stockAnterior = _context.Entry(producto).OriginalValues["Stock"] as int? ?? 0;
        var diferencia = producto.Stock - stockAnterior;

        if (diferencia != 0)
            _context.MovimientosStock.Add(new MovimientoStock
            {
                IdProducto = producto.IdProducto,
                TipoMovimiento = "Ajuste",
                Cantidad = diferencia,
                PrecioUnitario = producto.PrecioUnitario,
                Motivo = diferencia > 0 ? "Incremento de stock" : "Reducción de stock"
            });

        _context.Productos.Update(producto);
        await _context.SaveChangesAsync();
        return producto;
    }

    public async Task<Producto?> ActualizarImagenAsync(int idProducto, string? imagenUrl)
    {
        var producto = await _context.Productos.FindAsync(idProducto);
        if (producto is null || producto.Eliminado) return null;

        producto.ImagenUrl = imagenUrl;
        await _context.SaveChangesAsync();
        return producto;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var producto = await ObtenerPorIdAsync(id);
        if (producto is null) return false;

        _context.MovimientosStock.Add(new MovimientoStock
        {
            IdProducto = id,
            TipoMovimiento = "Salida",
            Cantidad = producto.Stock,
            PrecioUnitario = producto.PrecioUnitario,
            Motivo = "Eliminación de producto"
        });

        producto.Eliminado = true;
        producto.FechaEliminado = DateTime.Now;
        await _context.SaveChangesAsync();
        return true;
    }
}
