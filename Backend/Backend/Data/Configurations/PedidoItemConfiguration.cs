using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TiendaApi.Models;

namespace TiendaApi.Data.Configurations;

public class PedidoItemConfiguration : IEntityTypeConfiguration<PedidoItem>
{
    public void Configure(EntityTypeBuilder<PedidoItem> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.PrecioUnitario).HasColumnType("numeric(12,2)");
        builder.Property(i => i.NombreProducto).IsRequired().HasMaxLength(150);

        builder.HasOne(i => i.Pedido)
            .WithMany(p => p.Items)
            .HasForeignKey(i => i.PedidoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.Producto)
            .WithMany()
            .HasForeignKey(i => i.ProductoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
