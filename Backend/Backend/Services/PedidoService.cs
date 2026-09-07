using TiendaApi.DTOs;
using TiendaApi.Models;
using TiendaApi.Repositories.Interfaces;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Services;

public class PedidoService : IPedidoService
{
    private readonly IPedidoRepository _repo;
    private readonly IProductoRepository _productoRepo;
    private readonly IMercadoPagoService _mercadoPagoService;

    public PedidoService(IPedidoRepository repo, IProductoRepository productoRepo, IMercadoPagoService mercadoPagoService)
    {
        _repo = repo;
        _productoRepo = productoRepo;
        _mercadoPagoService = mercadoPagoService;
    }

    public async Task<PedidoCreadoDto> CrearAsync(CrearPedidoDto dto)
    {
        if (dto.Items is null || dto.Items.Count == 0)
            throw new ArgumentException("El pedido debe tener al menos un item.");

        var idsProductos = dto.Items.Select(i => i.ProductoId).Distinct().ToList();
        var productos = (await _productoRepo.ObtenerPorIdsAsync(idsProductos))
            .ToDictionary(p => p.IdProducto);

        var cantidadPorProducto = dto.Items
            .GroupBy(i => i.ProductoId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Cantidad));

        var items = new List<PedidoItem>();
        foreach (var itemDto in dto.Items)
        {
            if (!productos.TryGetValue(itemDto.ProductoId, out var producto))
                throw new ArgumentException($"El producto {itemDto.ProductoId} no existe.");

            if (itemDto.Cantidad < 1)
                throw new ArgumentException($"La cantidad para \"{producto.Nombre}\" debe ser al menos 1.");

            if (cantidadPorProducto[itemDto.ProductoId] > producto.Stock)
                throw new ArgumentException($"No hay stock suficiente de \"{producto.Nombre}\".");

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
            Items = items
        };

        var resultado = await _repo.AgregarAsync(pedido);

        var preferencia = await _mercadoPagoService.CrearPreferenciaAsync(resultado);
        await _repo.ActualizarPreferenceIdAsync(resultado.Id, preferencia.PreferenceId);

        return new PedidoCreadoDto(resultado.Id, preferencia.InitPoint);
    }

    public async Task<PedidoResponseDto?> ObtenerPorIdAsync(int id)
    {
        var pedido = await _repo.ObtenerPorIdAsync(id);
        return pedido is null ? null : ToDto(pedido);
    }

    private static PedidoResponseDto ToDto(Pedido p) =>
        new(p.Id, p.Estado.ToString(), p.Total,
            p.Items.Select(i => new PedidoItemResponseDto(i.ProductoId, i.NombreProducto, i.Cantidad, i.PrecioUnitario)).ToList());
}
