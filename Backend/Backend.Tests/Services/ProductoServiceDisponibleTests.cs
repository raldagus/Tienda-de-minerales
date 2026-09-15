using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Moq;
using TiendaApi.Data;
using TiendaApi.Models;
using TiendaApi.Repositories;
using TiendaApi.Services;
using TiendaApi.Services.Interfaces;
using Xunit;

namespace Backend.Tests.Services;

public class ProductoServiceDisponibleTests
{
    private static TiendaDbContext CrearContexto(string nombreBd)
    {
        var opciones = new DbContextOptionsBuilder<TiendaDbContext>()
            .UseInMemoryDatabase(nombreBd)
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new TiendaDbContext(opciones);
    }

    private static ProductoService CrearServicio(TiendaDbContext ctx)
    {
        var productoRepo = new ProductoRepository(ctx);
        var categoriaRepo = new CategoriaRepository(ctx);
        var imagenServiceMock = new Mock<IImagenService>();
        return new ProductoService(productoRepo, categoriaRepo, imagenServiceMock.Object);
    }

    [Fact]
    public async Task ObtenerPorIdAsync_calcula_disponible_como_stock_menos_reservado()
    {
        var ctx = CrearContexto(nameof(ObtenerPorIdAsync_calcula_disponible_como_stock_menos_reservado));
        var categoria = new Categoria { Nombre = "Cuarzos" };
        var producto = new Producto { Nombre = "Cuarzo rosa", PrecioUnitario = 4500m, Stock = 10, StockReservado = 3, Categoria = categoria };
        ctx.Categorias.Add(categoria);
        ctx.Productos.Add(producto);
        await ctx.SaveChangesAsync();

        var resultado = await CrearServicio(ctx).ObtenerPorIdAsync(producto.IdProducto);

        Assert.NotNull(resultado);
        Assert.Equal(7, resultado!.Disponible);
    }

    [Fact]
    public async Task ObtenerPorIdAsync_nunca_devuelve_disponible_negativo()
    {
        var ctx = CrearContexto(nameof(ObtenerPorIdAsync_nunca_devuelve_disponible_negativo));
        var categoria = new Categoria { Nombre = "Cuarzos" };
        var producto = new Producto { Nombre = "Cuarzo rosa", PrecioUnitario = 4500m, Stock = 5, StockReservado = 8, Categoria = categoria };
        ctx.Categorias.Add(categoria);
        ctx.Productos.Add(producto);
        await ctx.SaveChangesAsync();

        var resultado = await CrearServicio(ctx).ObtenerPorIdAsync(producto.IdProducto);

        Assert.Equal(0, resultado!.Disponible);
    }

    [Fact]
    public async Task ObtenerTodosAsync_incluye_disponible_por_cada_producto()
    {
        var ctx = CrearContexto(nameof(ObtenerTodosAsync_incluye_disponible_por_cada_producto));
        var categoria = new Categoria { Nombre = "Cuarzos" };
        var producto = new Producto { Nombre = "Cuarzo rosa", PrecioUnitario = 4500m, Stock = 10, StockReservado = 4, Categoria = categoria };
        ctx.Categorias.Add(categoria);
        ctx.Productos.Add(producto);
        await ctx.SaveChangesAsync();

        var resultado = await CrearServicio(ctx).ObtenerTodosAsync();

        var item = Assert.Single(resultado);
        Assert.Equal(6, item.Disponible);
    }
}
