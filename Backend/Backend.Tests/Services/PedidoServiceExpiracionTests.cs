using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using TiendaApi.Data;
using TiendaApi.Models;
using TiendaApi.Repositories;
using TiendaApi.Services;
using Xunit;

namespace Backend.Tests.Services;

public class PedidoServiceExpiracionTests
{
    private static TiendaDbContext CrearContexto(string nombreBd)
    {
        var opciones = new DbContextOptionsBuilder<TiendaDbContext>()
            .UseInMemoryDatabase(nombreBd)
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new TiendaDbContext(opciones);
    }

    private static async Task<(TiendaDbContext Ctx, PedidoService Servicio, Producto Producto)> CrearEscenarioAsync(string nombreBd)
    {
        var ctx = CrearContexto(nombreBd);
        var categoria = new Categoria { Nombre = "Cuarzos" };
        var producto = new Producto { Nombre = "Cuarzo rosa", PrecioUnitario = 4500m, Stock = 10, StockReservado = 0, Categoria = categoria };
        ctx.Categorias.Add(categoria);
        ctx.Productos.Add(producto);
        await ctx.SaveChangesAsync();

        var servicio = new PedidoService(new PedidoRepository(ctx), new ProductoRepository(ctx), ctx);
        return (ctx, servicio, producto);
    }

    private static Pedido CrearPedido(Producto producto, string numero, EstadoPedido estado, DateTime fechaExpiracion, int cantidad = 2) =>
        new()
        {
            NombreComprador = "Juan Pérez",
            EmailComprador = "juan@mail.com",
            NumeroPedido = numero,
            Estado = estado,
            FechaExpiracion = fechaExpiracion,
            Total = cantidad * 4500m,
            Items = new List<PedidoItem>
            {
                new() { ProductoId = producto.IdProducto, Cantidad = cantidad, PrecioUnitario = 4500m, NombreProducto = producto.Nombre }
            }
        };

    [Fact]
    public async Task Expira_los_pendientes_vencidos_libera_la_reserva_y_no_registra_movimientos()
    {
        var (ctx, servicio, producto) = await CrearEscenarioAsync(nameof(Expira_los_pendientes_vencidos_libera_la_reserva_y_no_registra_movimientos));
        producto.StockReservado = 2;
        ctx.Pedidos.Add(CrearPedido(producto, "VENC", EstadoPedido.Pendiente, DateTime.UtcNow.AddHours(-1)));
        await ctx.SaveChangesAsync();

        var expirados = await servicio.ExpirarVencidosAsync();

        Assert.Equal(1, expirados);
        var pedido = await ctx.Pedidos.SingleAsync(p => p.NumeroPedido == "VENC");
        Assert.Equal(EstadoPedido.Expirado, pedido.Estado);
        var productoActualizado = await ctx.Productos.SingleAsync(p => p.IdProducto == producto.IdProducto);
        Assert.Equal(0, productoActualizado.StockReservado); // 2 - 2
        Assert.Equal(10, productoActualizado.Stock);         // sin cambios
        Assert.Empty(ctx.MovimientosStock);
    }

    [Fact]
    public async Task No_toca_los_pendientes_cuya_fecha_todavia_no_vencio()
    {
        var (ctx, servicio, producto) = await CrearEscenarioAsync(nameof(No_toca_los_pendientes_cuya_fecha_todavia_no_vencio));
        producto.StockReservado = 2;
        ctx.Pedidos.Add(CrearPedido(producto, "FUT", EstadoPedido.Pendiente, DateTime.UtcNow.AddHours(1)));
        await ctx.SaveChangesAsync();

        var expirados = await servicio.ExpirarVencidosAsync();

        Assert.Equal(0, expirados);
        var pedido = await ctx.Pedidos.SingleAsync(p => p.NumeroPedido == "FUT");
        Assert.Equal(EstadoPedido.Pendiente, pedido.Estado);
        var productoActualizado = await ctx.Productos.SingleAsync(p => p.IdProducto == producto.IdProducto);
        Assert.Equal(2, productoActualizado.StockReservado);
    }

    [Fact]
    public async Task No_toca_pedidos_que_no_estan_pendientes_aunque_esten_vencidos()
    {
        var (ctx, servicio, producto) = await CrearEscenarioAsync(nameof(No_toca_pedidos_que_no_estan_pendientes_aunque_esten_vencidos));
        ctx.Pedidos.Add(CrearPedido(producto, "CONF", EstadoPedido.Confirmado, DateTime.UtcNow.AddHours(-5)));
        ctx.Pedidos.Add(CrearPedido(producto, "CANC", EstadoPedido.Cancelado, DateTime.UtcNow.AddHours(-5)));
        await ctx.SaveChangesAsync();

        var expirados = await servicio.ExpirarVencidosAsync();

        Assert.Equal(0, expirados);
        Assert.Equal(EstadoPedido.Confirmado, (await ctx.Pedidos.SingleAsync(p => p.NumeroPedido == "CONF")).Estado);
        Assert.Equal(EstadoPedido.Cancelado, (await ctx.Pedidos.SingleAsync(p => p.NumeroPedido == "CANC")).Estado);
    }

    [Fact]
    public async Task Sin_pedidos_vencidos_devuelve_cero()
    {
        var (_, servicio, _) = await CrearEscenarioAsync(nameof(Sin_pedidos_vencidos_devuelve_cero));

        Assert.Equal(0, await servicio.ExpirarVencidosAsync());
    }

    [Fact]
    public async Task Expira_varios_pedidos_en_una_sola_corrida()
    {
        var (ctx, servicio, producto) = await CrearEscenarioAsync(nameof(Expira_varios_pedidos_en_una_sola_corrida));
        producto.StockReservado = 5;
        ctx.Pedidos.Add(CrearPedido(producto, "V1", EstadoPedido.Pendiente, DateTime.UtcNow.AddHours(-2), cantidad: 2));
        ctx.Pedidos.Add(CrearPedido(producto, "V2", EstadoPedido.Pendiente, DateTime.UtcNow.AddHours(-3), cantidad: 3));
        await ctx.SaveChangesAsync();

        var expirados = await servicio.ExpirarVencidosAsync();

        Assert.Equal(2, expirados);
        var productoActualizado = await ctx.Productos.SingleAsync(p => p.IdProducto == producto.IdProducto);
        Assert.Equal(0, productoActualizado.StockReservado); // 5 - 2 - 3
    }
}
