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
}
