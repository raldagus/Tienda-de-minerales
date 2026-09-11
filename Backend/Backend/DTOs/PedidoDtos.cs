namespace TiendaApi.DTOs;

public record CrearPedidoItemDto(
    int ProductoId,
    int Cantidad
);

public record CrearPedidoDto(
    string Nombre,
    string Email,
    string? Telefono,
    string? Direccion,
    List<CrearPedidoItemDto> Items
);

public record PedidoCreadoDto(
    int PedidoId,
    string NumeroPedido,
    string MensajeWhatsApp
);

public record PedidoItemResponseDto(
    int ProductoId,
    string NombreProducto,
    int Cantidad,
    decimal PrecioUnitario
);

public record PedidoResponseDto(
    int Id,
    string NumeroPedido,
    string NombreComprador,
    string Estado,
    decimal Total,
    DateTime FechaCreacion,
    List<PedidoItemResponseDto> Items
);
