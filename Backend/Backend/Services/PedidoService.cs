using System.Globalization;
using Microsoft.EntityFrameworkCore;
using TiendaApi.Data;
using TiendaApi.DTOs;
using TiendaApi.Models;
using TiendaApi.Repositories.Interfaces;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Services;

public class PedidoService : IPedidoService
{
    private const string CaracteresNumeroPedido = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I para evitar confusión al leerlo por WhatsApp
    private static readonly CultureInfo CulturaMonto = new("es-AR");

    private readonly IPedidoRepository _repo;
    private readonly IProductoRepository _productoRepo;
    private readonly TiendaDbContext _context;

    public PedidoService(IPedidoRepository repo, IProductoRepository productoRepo, TiendaDbContext context)
    {
        _repo = repo;
        _productoRepo = productoRepo;
        _context = context;
    }

    public async Task<PedidoCreadoDto> CrearAsync(CrearPedidoDto dto)
    {
        if (dto.Items is null || dto.Items.Count == 0)
            throw new ArgumentException("El pedido debe tener al menos un item.");

        var itemsAgrupados = dto.Items
            .GroupBy(i => i.ProductoId)
            .Select(g => new CrearPedidoItemDto(g.Key, g.Sum(i => i.Cantidad)))
            .ToList();

        var idsProductos = itemsAgrupados.Select(i => i.ProductoId).ToList();
        var productos = (await _productoRepo.ObtenerPorIdsAsync(idsProductos))
            .ToDictionary(p => p.IdProducto);

        var items = new List<PedidoItem>();
        foreach (var itemDto in itemsAgrupados)
        {
            if (!productos.TryGetValue(itemDto.ProductoId, out var producto))
                throw new ArgumentException($"El producto {itemDto.ProductoId} no existe.");

            if (itemDto.Cantidad < 1)
                throw new ArgumentException($"La cantidad para \"{producto.Nombre}\" debe ser al menos 1.");

            var disponible = producto.Stock - producto.StockReservado;
            if (itemDto.Cantidad > disponible)
                throw new ArgumentException($"No hay stock suficiente de \"{producto.Nombre}\".");

            producto.StockReservado += itemDto.Cantidad;

            items.Add(new PedidoItem
            {
                ProductoId = producto.IdProducto,
                Cantidad = itemDto.Cantidad,
                PrecioUnitario = producto.PrecioUnitario,
                NombreProducto = producto.Nombre
            });
        }

        var pedido = new Pedido
        {
            NombreComprador = dto.Nombre,
            EmailComprador = dto.Email,
            Telefono = dto.Telefono,
            DireccionEnvio = dto.Direccion,
            Total = items.Sum(i => i.Cantidad * i.PrecioUnitario),
            Items = items,
            NumeroPedido = GenerarNumeroPedido(),
            FechaExpiracion = DateTime.UtcNow.AddHours(48)
        };

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var resultado = await _repo.AgregarAsync(pedido);
            await transaction.CommitAsync();

            return new PedidoCreadoDto(resultado.Id, resultado.NumeroPedido, ConstruirMensajeWhatsApp(resultado));
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ArgumentException("Uno de los productos ya no está disponible.");
        }
    }

    public async Task<PedidoResponseDto?> ObtenerPorIdAsync(int id)
    {
        var pedido = await _repo.ObtenerPorIdAsync(id);
        return pedido is null ? null : ToDto(pedido);
    }

    private static string GenerarNumeroPedido()
    {
        Span<char> buffer = stackalloc char[4];
        for (var i = 0; i < buffer.Length; i++)
            buffer[i] = CaracteresNumeroPedido[Random.Shared.Next(CaracteresNumeroPedido.Length)];
        return new string(buffer);
    }

    private static string ConstruirMensajeWhatsApp(Pedido pedido)
    {
        var lineasItems = string.Join("\n", pedido.Items.Select(i =>
            $"- {i.NombreProducto} x{i.Cantidad} — ${(i.Cantidad * i.PrecioUnitario).ToString("N0", CulturaMonto)}"));

        return $"Pedido #{pedido.NumeroPedido}\n\n{lineasItems}\n\nTotal: ${pedido.Total.ToString("N0", CulturaMonto)}\n\nNombre: {pedido.NombreComprador}";
    }

    private static PedidoResponseDto ToDto(Pedido p) =>
        new(p.Id, p.Estado.ToString(), p.Total,
            p.Items.Select(i => new PedidoItemResponseDto(i.ProductoId, i.NombreProducto, i.Cantidad, i.PrecioUnitario)).ToList());
}
