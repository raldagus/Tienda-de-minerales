using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TiendaApi.Models;

namespace TiendaApi.Data.Configurations;

public class MovimientoStockConfiguration : IEntityTypeConfiguration<MovimientoStock>
{
    public void Configure(EntityTypeBuilder<MovimientoStock> builder)
    {
        builder.HasKey(m => m.IdMovimiento);
        builder.Property(m => m.TipoMovimiento).IsRequired().HasMaxLength(20);
        builder.Property(m => m.PrecioUnitario).HasColumnType("numeric(12,2)");

        builder.HasOne(m => m.Producto)
            .WithMany(p => p.Movimientos)
            .HasForeignKey(m => m.IdProducto);
    }
}
