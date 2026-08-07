using TiendaApi.DTOs;

namespace TiendaApi.Services.Interfaces;

public interface ICategoriaService
{
    Task<IEnumerable<CategoriaResponseDto>> ObtenerTodosAsync();
    Task<CategoriaResponseDto?> ObtenerPorIdAsync(int id);
    Task<CategoriaResponseDto> AgregarAsync(CategoriaCrearDto dto);
    Task<CategoriaResponseDto?> ModificarAsync(int id, CategoriaEditarDto dto);
    Task<bool> EliminarAsync(int id);
}
