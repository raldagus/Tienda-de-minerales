using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TiendaApi.Models;

namespace TiendaApi.Data.Configurations;

public class PedidoConfiguration : IEntityTypeConfiguration<Pedido>
{
    public void Configure(EntityTypeBuilder<Pedido> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.NombreComprador).IsRequired().HasMaxLength(150);
        builder.Property(p => p.EmailComprador).IsRequired().HasMaxLength(150);
        builder.Property(p => p.Telefono).HasMaxLength(30);
        builder.Property(p => p.DireccionEnvio).HasMaxLength(255);
        builder.Property(p => p.Total).HasColumnType("numeric(12,2)");
        builder.Property(p => p.Estado).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.PreferenceId).HasMaxLength(100);

        builder.HasIndex(p => p.PreferenceId);
        builder.HasIndex(p => p.Estado);
    }
}
