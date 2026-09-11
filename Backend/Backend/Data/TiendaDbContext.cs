using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using TiendaApi.Models;

namespace TiendaApi.Data;

public class TiendaDbContext : DbContext
{
    public TiendaDbContext(DbContextOptions<TiendaDbContext> options) : base(options) { }

    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<MovimientoStock> MovimientosStock => Set<MovimientoStock>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<PedidoItem> PedidoItems => Set<PedidoItem>();
    public DbSet<Pago> Pagos => Set<Pago>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TiendaDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        AplicarMarcasDeTiempo();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        AplicarMarcasDeTiempo();
        return base.SaveChanges();
    }

    private void AplicarMarcasDeTiempo()
    {
        var ahora = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<Categoria>())
        {
            if (entry.State == EntityState.Modified && entry.Entity.Eliminado)
                entry.Entity.FechaEliminado ??= ahora;
        }

        foreach (var entry in ChangeTracker.Entries<Producto>())
        {
            if (entry.State == EntityState.Modified && entry.Entity.Eliminado)
                entry.Entity.FechaEliminado ??= ahora;
        }

        foreach (var entry in ChangeTracker.Entries<MovimientoStock>())
        {
            if (entry.State == EntityState.Added && entry.Entity.FechaMovimiento == default)
                entry.Entity.FechaMovimiento = ahora;
        }

        foreach (var entry in ChangeTracker.Entries<Pedido>())
        {
            if (entry.State == EntityState.Added && entry.Entity.FechaCreacion == default)
                entry.Entity.FechaCreacion = ahora;
        }
    }
}