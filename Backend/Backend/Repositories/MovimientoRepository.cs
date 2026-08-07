using Microsoft.EntityFrameworkCore;
using TiendaApi.Data;
using TiendaApi.Models;
using TiendaApi.Repositories.Interfaces;

namespace TiendaApi.Repositories;

public class MovimientoRepository : IMovimientoRepository
{
    private readonly TiendaDbContext _context;

    public MovimientoRepository(TiendaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MovimientoStock>> ObtenerTodosAsync(int? idProducto = null)
        => await _context.MovimientosStock
            .Include(m => m.Producto)
            .Where(m => idProducto == null || m.IdProducto == idProducto)
            .OrderByDescending(m => m.FechaMovimiento)
            .ToListAsync();

    public async Task<MovimientoStock?> ObtenerPorIdAsync(int id)
        => await _context.MovimientosStock
            .Include(m => m.Producto)
            .FirstOrDefaultAsync(m => m.IdMovimiento == id);

    public async Task<MovimientoStock> RegistrarAsync(MovimientoStock movimiento)
    {
        _context.MovimientosStock.Add(movimiento);
        await _context.SaveChangesAsync();
        return movimiento;
    }
}
