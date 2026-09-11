using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using TiendaApi.Data;
using TiendaApi.Models;
using TiendaApi.Repositories;
using TiendaApi.Services;
using Xunit;

namespace Backend.Tests.Services;

public class PedidoServiceGestionTests
{
    private static TiendaDbContext CrearContexto(string nombreBd)
    {
        var opciones = new DbContextOptionsBuilder<TiendaDbContext>()
            .UseInMemoryDatabase(nombreBd)
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new TiendaDbContext(opciones);
    }

    private static async Task<(TiendaDbContext Ctx, PedidoService Servicio, Producto Producto, Pedido Pedido)> CrearEscenarioPendienteAsync(
        string nombreBd, int stock = 10, int stockReservado = 2, int cantidadItem = 2)
    {
        var ctx = CrearContexto(nombreBd);
        var categoria = new Categoria { Nombre = "Cuarzos" };
        var producto = new Producto { Nombre = "Cuarzo rosa", PrecioUnitario = 4500m, Stock = stock, StockReservado = stockReservado, Categoria = categoria };
        ctx.Categorias.Add(categoria);
        ctx.Productos.Add(producto);
        await ctx.SaveChangesAsync();

        var pedido = new Pedido
        {
            NombreComprador = "Juan Pérez",
            EmailComprador = "juan@mail.com",
            NumeroPedido = "A7K3",
            FechaExpiracion = DateTime.UtcNow.AddHours(48),
            Estado = EstadoPedido.Pendiente,
            Total = cantidadItem * 4500m,
            Items = new List<PedidoItem>
            {
                new() { ProductoId = producto.IdProducto, Cantidad = cantidadItem, PrecioUnitario = 4500m, NombreProducto = "Cuarzo rosa" }
            }
        };
        ctx.Pedidos.Add(pedido);
        await ctx.SaveChangesAsync();

        var servicio = new PedidoService(new PedidoRepository(ctx), new ProductoRepository(ctx), ctx);
        return (ctx, servicio, producto, pedido);
    }

    [Fact]
    public async Task Confirmar_descuenta_stock_fisico_libera_la_reserva_y_registra_el_movimiento()
    {
        var (ctx, servicio, producto, pedido) = await CrearEscenarioPendienteAsync(
            nameof(Confirmar_descuenta_stock_fisico_libera_la_reserva_y_registra_el_movimiento));

        var resultado = await servicio.ConfirmarAsync(pedido.Id);

        Assert.NotNull(resultado);
        Assert.Equal("Confirmado", resultado!.Estado);

        var productoActualizado = await ctx.Productos.SingleAsync(p => p.IdProducto == producto.IdProducto);
        Assert.Equal(8, productoActualizado.Stock);       // 10 - 2
        Assert.Equal(0, productoActualizado.StockReservado); // 2 - 2

        var movimiento = Assert.Single(ctx.MovimientosStock);
        Assert.Equal("Salida", movimiento.TipoMovimiento);
        Assert.Equal(2, movimiento.Cantidad);
        Assert.Equal("Pedido #A7K3", movimiento.Motivo);
    }

    [Fact]
    public async Task Confirmar_un_pedido_que_no_esta_pendiente_lanza_conflicto()
    {
        var (_, servicio, _, pedido) = await CrearEscenarioPendienteAsync(
            nameof(Confirmar_un_pedido_que_no_esta_pendiente_lanza_conflicto));
        await servicio.ConfirmarAsync(pedido.Id); // ahora está Confirmado

        await Assert.ThrowsAsync<InvalidOperationException>(() => servicio.ConfirmarAsync(pedido.Id));
    }

    [Fact]
    public async Task Confirmar_un_pedido_inexistente_devuelve_null()
    {
        var (_, servicio, _, _) = await CrearEscenarioPendienteAsync(
            nameof(Confirmar_un_pedido_inexistente_devuelve_null));

        var resultado = await servicio.ConfirmarAsync(9999);

        Assert.Null(resultado);
    }

    [Fact]
    public async Task Cancelar_libera_la_reserva_sin_tocar_el_stock_fisico_ni_crear_movimientos()
    {
        var (ctx, servicio, producto, pedido) = await CrearEscenarioPendienteAsync(
            nameof(Cancelar_libera_la_reserva_sin_tocar_el_stock_fisico_ni_crear_movimientos));

        var resultado = await servicio.CancelarAsync(pedido.Id);

        Assert.NotNull(resultado);
        Assert.Equal("Cancelado", resultado!.Estado);

        var productoActualizado = await ctx.Productos.SingleAsync(p => p.IdProducto == producto.IdProducto);
        Assert.Equal(10, productoActualizado.Stock);      // sin cambios
        Assert.Equal(0, productoActualizado.StockReservado); // 2 - 2

        Assert.Empty(ctx.MovimientosStock);
    }

    [Fact]
    public async Task Cancelar_un_pedido_que_no_esta_pendiente_lanza_conflicto()
    {
        var (_, servicio, _, pedido) = await CrearEscenarioPendienteAsync(
            nameof(Cancelar_un_pedido_que_no_esta_pendiente_lanza_conflicto));
        await servicio.CancelarAsync(pedido.Id); // ahora está Cancelado

        await Assert.ThrowsAsync<InvalidOperationException>(() => servicio.CancelarAsync(pedido.Id));
    }

    [Fact]
    public async Task Cancelar_un_pedido_inexistente_devuelve_null()
    {
        var (_, servicio, _, _) = await CrearEscenarioPendienteAsync(
            nameof(Cancelar_un_pedido_inexistente_devuelve_null));

        var resultado = await servicio.CancelarAsync(9999);

        Assert.Null(resultado);
    }

    [Fact]
    public async Task Listar_sin_filtro_devuelve_todos_ordenados_por_fecha_de_creacion_descendente()
    {
        var ctx = CrearContexto(nameof(Listar_sin_filtro_devuelve_todos_ordenados_por_fecha_de_creacion_descendente));
        var categoria = new Categoria { Nombre = "Cuarzos" };
        var producto = new Producto { Nombre = "Cuarzo rosa", PrecioUnitario = 4500m, Stock = 10, Categoria = categoria };
        ctx.Categorias.Add(categoria);
        ctx.Productos.Add(producto);
        await ctx.SaveChangesAsync();

        var masViejo = new Pedido { NombreComprador = "A", EmailComprador = "a@mail.com", NumeroPedido = "AAAA", FechaCreacion = DateTime.UtcNow.AddHours(-2), FechaExpiracion = DateTime.UtcNow.AddHours(46), Estado = EstadoPedido.Pendiente };
        var masNuevo = new Pedido { NombreComprador = "B", EmailComprador = "b@mail.com", NumeroPedido = "BBBB", FechaCreacion = DateTime.UtcNow, FechaExpiracion = DateTime.UtcNow.AddHours(24), Estado = EstadoPedido.Confirmado };
        ctx.Pedidos.AddRange(masViejo, masNuevo);
        await ctx.SaveChangesAsync();

        var servicio = new PedidoService(new PedidoRepository(ctx), new ProductoRepository(ctx), ctx);

        var resultado = (await servicio.ListarAsync(null)).ToList();

        Assert.Equal(2, resultado.Count);
        Assert.Equal("BBBB", resultado[0].NumeroPedido);
        Assert.Equal("AAAA", resultado[1].NumeroPedido);
    }

    [Fact]
    public async Task Listar_filtra_por_estado()
    {
        var ctx = CrearContexto(nameof(Listar_filtra_por_estado));
        var pendiente = new Pedido { NombreComprador = "A", EmailComprador = "a@mail.com", NumeroPedido = "AAAA", FechaExpiracion = DateTime.UtcNow, Estado = EstadoPedido.Pendiente };
        var confirmado = new Pedido { NombreComprador = "B", EmailComprador = "b@mail.com", NumeroPedido = "BBBB", FechaExpiracion = DateTime.UtcNow, Estado = EstadoPedido.Confirmado };
        ctx.Pedidos.AddRange(pendiente, confirmado);
        await ctx.SaveChangesAsync();

        var servicio = new PedidoService(new PedidoRepository(ctx), new ProductoRepository(ctx), ctx);

        var resultado = (await servicio.ListarAsync(EstadoPedido.Pendiente)).ToList();

        var item = Assert.Single(resultado);
        Assert.Equal("AAAA", item.NumeroPedido);
    }
}
