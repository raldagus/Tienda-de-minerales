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
    int PedidoId
);

public record PedidoItemResponseDto(
    int ProductoId,
    string NombreProducto,
    int Cantidad,
    decimal PrecioUnitario
);

public record PedidoResponseDto(
    int Id,
    string Estado,
    decimal Total,
    List<PedidoItemResponseDto> Items
);
