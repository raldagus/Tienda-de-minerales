using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TiendaApi.Models;

namespace TiendaApi.Data.Configurations;

public class CategoriaConfiguration : IEntityTypeConfiguration<Categoria>
{
    public void Configure(EntityTypeBuilder<Categoria> builder)
    {
        builder.HasKey(c => c.IdCategoria);
        builder.Property(c => c.Nombre).IsRequired().HasMaxLength(100);
    }
}
