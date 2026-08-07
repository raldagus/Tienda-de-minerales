namespace TiendaApi.DTOs;

public record CategoriaResponseDto(
    int IdCategoria,
    string Nombre,
    string? Descripcion
);

public record CategoriaCrearDto(
    string Nombre,
    string? Descripcion
);

public record CategoriaEditarDto(
    string Nombre,
    string? Descripcion
);
