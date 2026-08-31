using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TiendaApi.Models;

namespace TiendaApi.Data.Configurations;

public class PagoConfiguration : IEntityTypeConfiguration<Pago>
{
    public void Configure(EntityTypeBuilder<Pago> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.PaymentIdExterno).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Estado).IsRequired().HasMaxLength(30);
        builder.Property(p => p.Monto).HasColumnType("numeric(12,2)");
        builder.Property(p => p.MetodoPago).HasMaxLength(50);
        builder.Property(p => p.PayloadCrudo).IsRequired();

        builder.HasIndex(p => p.PaymentIdExterno).IsUnique();

        builder.HasOne(p => p.Pedido)
            .WithMany(ped => ped.Pagos)
            .HasForeignKey(p => p.PedidoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
