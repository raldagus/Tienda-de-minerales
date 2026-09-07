namespace TiendaApi.DTOs;

public record ProductoResponseDto(
    int IdProducto,
    string Nombre,
    string? Descripcion,
    string? Codigo,
    decimal PrecioUnitario,
    int Stock,
    int? CalibreMm,
    int IdCategoria,
    string NombreCategoria,
    string? ImagenUrl
);

public record ProductoCrearDto(
    int IdCategoria,
    string Nombre,
    string? Descripcion,
    string? Codigo,
    decimal PrecioUnitario,
    int Stock,
    int? CalibreMm
);

public record ProductoEditarDto(
    int IdCategoria,
    string Nombre,
    string? Descripcion,
    string? Codigo,
    decimal PrecioUnitario,
    int Stock,
    int? CalibreMm

);
