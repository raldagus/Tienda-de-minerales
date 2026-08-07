using TiendaApi.DTOs;

namespace TiendaApi.Services.Interfaces;

public interface IProductoService
{
    Task<IEnumerable<ProductoResponseDto>> ObtenerTodosAsync(int? idCategoria = null);
    Task<ProductoResponseDto?> ObtenerPorIdAsync(int id);
    Task<ProductoResponseDto> AgregarAsync(ProductoCrearDto dto);
    Task<ProductoResponseDto?> ModificarAsync(int id, ProductoEditarDto dto);
    Task<ProductoResponseDto?> SubirImagenAsync(int id, IFormFile archivo);
    Task<bool> EliminarImagenAsync(int id);
    Task<bool> EliminarAsync(int id);
}
