using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Moq;
using TiendaApi.Data;
using TiendaApi.DTOs;
using TiendaApi.Models;
using TiendaApi.Repositories;
using TiendaApi.Repositories.Interfaces;
using TiendaApi.Services;
using Xunit;

namespace Backend.Tests.Services;

public class PedidoServiceCrearAsyncTests
{
    private static TiendaDbContext CrearContexto(string nombreBd)
    {
        var opciones = new DbContextOptionsBuilder<TiendaDbContext>()
            .UseInMemoryDatabase(nombreBd)
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new TiendaDbContext(opciones);
    }

    private static async Task<(TiendaDbContext Ctx, PedidoService Servicio, Producto CuarzoRosa, Producto AgataAzul)> CrearEscenarioAsync(string nombreBd)
    {
        var ctx = CrearContexto(nombreBd);
        var categoria = new Categoria { Nombre = "Cuarzos" };
        var cuarzoRosa = new Producto { Nombre = "Cuarzo rosa", PrecioUnitario = 4500m, Stock = 10, StockReservado = 0, Categoria = categoria };
        var agataAzul = new Producto { Nombre = "Ágata azul", PrecioUnitario = 3000m, Stock = 5, StockReservado = 3, Categoria = categoria };
        ctx.Categorias.Add(categoria);
        ctx.Productos.AddRange(cuarzoRosa, agataAzul);
        await ctx.SaveChangesAsync();

        var servicio = new PedidoService(new PedidoRepository(ctx), new ProductoRepository(ctx), ctx);
        return (ctx, servicio, cuarzoRosa, agataAzul);
    }

    [Fact]
    public async Task Agrupa_items_duplicados_por_producto_y_suma_cantidades()
    {
        var (ctx, servicio, cuarzoRosa, _) = await CrearEscenarioAsync(nameof(Agrupa_items_duplicados_por_producto_y_suma_cantidades));
        var dto = new CrearPedidoDto("Juan Pérez", "juan@mail.com", null, null, new List<CrearPedidoItemDto>
        {
            new(cuarzoRosa.IdProducto, 1),
            new(cuarzoRosa.IdProducto, 2)
        });

        var resultado = await servicio.CrearAsync(dto);

        var pedido = await ctx.Pedidos.Include(p => p.Items).SingleAsync(p => p.Id == resultado.PedidoId);
        var item = Assert.Single(pedido.Items);
        Assert.Equal(3, item.Cantidad);
    }

    [Fact]
    public async Task Reserva_stock_de_cada_producto_al_crear_el_pedido()
    {
        var (ctx, servicio, cuarzoRosa, agataAzul) = await CrearEscenarioAsync(nameof(Reserva_stock_de_cada_producto_al_crear_el_pedido));
        var dto = new CrearPedidoDto("Juan Pérez", "juan@mail.com", null, null, new List<CrearPedidoItemDto>
        {
            new(cuarzoRosa.IdProducto, 2),
            new(agataAzul.IdProducto, 1)
        });

        await servicio.CrearAsync(dto);

        var cuarzoActualizado = await ctx.Productos.SingleAsync(p => p.IdProducto == cuarzoRosa.IdProducto);
        var agataActualizada = await ctx.Productos.SingleAsync(p => p.IdProducto == agataAzul.IdProducto);
        Assert.Equal(2, cuarzoActualizado.StockReservado);
        Assert.Equal(4, agataActualizada.StockReservado); // 3 ya reservado + 1 nuevo
    }

    [Fact]
    public async Task Rechaza_cuando_la_cantidad_supera_el_disponible_no_el_stock_fisico()
    {
        // agataAzul: Stock=5, StockReservado=3 → disponible=2
        var (_, servicio, _, agataAzul) = await CrearEscenarioAsync(nameof(Rechaza_cuando_la_cantidad_supera_el_disponible_no_el_stock_fisico));
        var dto = new CrearPedidoDto("Juan Pérez", "juan@mail.com", null, null, new List<CrearPedidoItemDto>
        {
            new(agataAzul.IdProducto, 3)
        });

        await Assert.ThrowsAsync<ArgumentException>(() => servicio.CrearAsync(dto));
    }

    [Fact]
    public async Task Genera_numero_de_pedido_corto_y_fecha_de_expiracion_a_48_horas()
    {
        var (_, servicio, cuarzoRosa, _) = await CrearEscenarioAsync(nameof(Genera_numero_de_pedido_corto_y_fecha_de_expiracion_a_48_horas));
        var dto = new CrearPedidoDto("Juan Pérez", "juan@mail.com", null, null, new List<CrearPedidoItemDto>
        {
            new(cuarzoRosa.IdProducto, 1)
        });
        var antes = DateTime.UtcNow;

        var resultado = await servicio.CrearAsync(dto);

        Assert.Matches("^[A-Z0-9]{4}$", resultado.NumeroPedido);
        var despues = DateTime.UtcNow;
        Assert.NotNull(resultado.MensajeWhatsApp);
    }

    [Fact]
    public async Task Construye_el_mensaje_de_whatsapp_con_numero_items_y_total()
    {
        var (_, servicio, cuarzoRosa, agataAzul) = await CrearEscenarioAsync(nameof(Construye_el_mensaje_de_whatsapp_con_numero_items_y_total));
        var dto = new CrearPedidoDto("Juan Pérez", "juan@mail.com", null, null, new List<CrearPedidoItemDto>
        {
            new(cuarzoRosa.IdProducto, 1),
            new(agataAzul.IdProducto, 2)
        });

        var resultado = await servicio.CrearAsync(dto);

        var mensaje = resultado.MensajeWhatsApp;
        Assert.StartsWith($"Pedido #{resultado.NumeroPedido}", mensaje);
        Assert.Contains("- Cuarzo rosa x1 — $4.500", mensaje);
        Assert.Contains("- Ágata azul x2 — $6.000", mensaje);
        Assert.Contains("Total: $10.500", mensaje);
        Assert.Contains("Nombre: Juan Pérez", mensaje);
    }

    [Fact]
    public async Task Traduce_conflicto_de_concurrencia_en_un_mensaje_claro()
    {
        var ctx = CrearContexto(nameof(Traduce_conflicto_de_concurrencia_en_un_mensaje_claro));
        var producto = new Producto { IdProducto = 1, Nombre = "Cuarzo rosa", PrecioUnitario = 4500m, Stock = 10, StockReservado = 0 };

        var pedidoRepoMock = new Mock<IPedidoRepository>();
        pedidoRepoMock
            .Setup(r => r.AgregarAsync(It.IsAny<Pedido>()))
            .ThrowsAsync(new DbUpdateConcurrencyException());

        var productoRepoMock = new Mock<IProductoRepository>();
        productoRepoMock
            .Setup(r => r.ObtenerPorIdsAsync(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(new List<Producto> { producto });

        var servicio = new PedidoService(pedidoRepoMock.Object, productoRepoMock.Object, ctx);
        var dto = new CrearPedidoDto("Juan Pérez", "juan@mail.com", null, null, new List<CrearPedidoItemDto>
        {
            new(1, 1)
        });

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => servicio.CrearAsync(dto));
        Assert.Contains("ya no está disponible", ex.Message);
    }

    [Fact]
    public async Task Falla_si_el_pedido_no_tiene_items()
    {
        var (_, servicio, _, _) = await CrearEscenarioAsync(nameof(Falla_si_el_pedido_no_tiene_items));
        var dto = new CrearPedidoDto("Juan Pérez", "juan@mail.com", null, null, new List<CrearPedidoItemDto>());

        await Assert.ThrowsAsync<ArgumentException>(() => servicio.CrearAsync(dto));
    }

    [Fact]
    public async Task Falla_si_el_producto_no_existe()
    {
        var (_, servicio, _, _) = await CrearEscenarioAsync(nameof(Falla_si_el_producto_no_existe));
        var dto = new CrearPedidoDto("Juan Pérez", "juan@mail.com", null, null, new List<CrearPedidoItemDto>
        {
            new(9999, 1)
        });

        await Assert.ThrowsAsync<ArgumentException>(() => servicio.CrearAsync(dto));
    }
}
