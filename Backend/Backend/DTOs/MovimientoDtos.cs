namespace TiendaApi.DTOs;

public record MovimientoResponseDto(
    int IdMovimiento,
    int IdProducto,
    string NombreProducto,
    string TipoMovimiento,
    int Cantidad,
    decimal PrecioUnitario,
    string? Motivo,
    DateTime FechaMovimiento
);

public record MovimientoCrearDto(
    int IdProducto,
    string TipoMovimiento,   // "Entrada" | "Salida" | "Ajuste"
    int Cantidad,
    string? Motivo
);
