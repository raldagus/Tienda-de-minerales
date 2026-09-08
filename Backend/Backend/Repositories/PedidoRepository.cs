using Microsoft.EntityFrameworkCore;
using TiendaApi.Data;
using TiendaApi.Models;
using TiendaApi.Repositories.Interfaces;

namespace TiendaApi.Repositories;

public class PedidoRepository : IPedidoRepository
{
    private readonly TiendaDbContext _context;

    public PedidoRepository(TiendaDbContext context)
    {
        _context = context;
    }

    public async Task<Pedido> AgregarAsync(Pedido pedido)
    {
        _context.Pedidos.Add(pedido);
        await _context.SaveChangesAsync();
        return pedido;
    }

    public async Task<Pedido?> ObtenerPorIdAsync(int id)
        => await _context.Pedidos
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<List<Pedido>> ListarAsync(EstadoPedido? estado)
    {
        var query = _context.Pedidos.Include(p => p.Items).AsQueryable();
        if (estado is not null)
            query = query.Where(p => p.Estado == estado);

        return await query.OrderByDescending(p => p.FechaExpiracion).ToListAsync();
    }

    public async Task ActualizarPreferenceIdAsync(int pedidoId, string preferenceId)
    {
        var pedido = await _context.Pedidos.FindAsync(pedidoId);
        if (pedido is null) return;

        pedido.PreferenceId = preferenceId;
        await _context.SaveChangesAsync();
    }
}
