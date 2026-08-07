using TiendaApi.DTOs;
using TiendaApi.Models;
using TiendaApi.Repositories.Interfaces;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Services;

public class ProductoService : IProductoService
{
    private readonly IProductoRepository _repo;
    private readonly ICategoriaRepository _categoriaRepo;
    private readonly IImagenService _imagenService;

    public ProductoService(IProductoRepository repo, ICategoriaRepository categoriaRepo, IImagenService imagenService)
    {
        _repo = repo;
        _categoriaRepo = categoriaRepo;
        _imagenService = imagenService;
    }

    public async Task<IEnumerable<ProductoResponseDto>> ObtenerTodosAsync(int? idCategoria = null)
    {
        var productos = await _repo.ObtenerTodosAsync(idCategoria);
        return productos.Select(ToDto);
    }

    public async Task<ProductoResponseDto?> ObtenerPorIdAsync(int id)
    {
        var producto = await _repo.ObtenerPorIdAsync(id);
        return producto is null ? null : ToDto(producto);
    }

    public async Task<ProductoResponseDto> AgregarAsync(ProductoCrearDto dto)
    {
        var categoria = await _categoriaRepo.ObtenerPorIdAsync(dto.IdCategoria)
            ?? throw new InvalidOperationException("La categoría indicada no existe.");

        var producto = new Producto
        {
            IdCategoria = dto.IdCategoria,
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Codigo = dto.Codigo,
            PrecioUnitario = dto.PrecioUnitario,
            Stock = dto.Stock,
            CalibreMn = dto.CalibreMn
        };

        var resultado = await _repo.AgregarAsync(producto);
        resultado.Categoria = categoria;
        return ToDto(resultado);
    }

    public async Task<ProductoResponseDto?> ModificarAsync(int id, ProductoEditarDto dto)
    {
        var producto = await _repo.ObtenerPorIdAsync(id);
        if (producto is null) return null;

        var categoria = await _categoriaRepo.ObtenerPorIdAsync(dto.IdCategoria)
            ?? throw new InvalidOperationException("La categoría indicada no existe.");

        producto.Nombre = dto.Nombre;
        producto.Descripcion = dto.Descripcion;
        producto.Codigo = dto.Codigo;
        producto.PrecioUnitario = dto.PrecioUnitario;
        producto.IdCategoria = dto.IdCategoria;
        producto.Stock = dto.Stock;
        producto.CalibreMn = dto.CalibreMn;

        var resultado = await _repo.ModificarAsync(producto);
        resultado.Categoria = categoria;
        return ToDto(resultado);
    }

    public async Task<ProductoResponseDto?> SubirImagenAsync(int id, IFormFile archivo)
    {
        var producto = await _repo.ObtenerPorIdAsync(id);
        if (producto is null) return null;

        var imagenAnterior = producto.ImagenUrl;
        var nuevaImagenUrl = await _imagenService.GuardarImagenProductoAsync(archivo, id);

        Producto? actualizado;
        try
        {
            actualizado = await _repo.ActualizarImagenAsync(id, nuevaImagenUrl);
        }
        catch
        {
            _imagenService.EliminarImagenProducto(nuevaImagenUrl);
            throw;
        }

        if (actualizado is null)
        {
            _imagenService.EliminarImagenProducto(nuevaImagenUrl);
            return null;
        }

        if (!string.IsNullOrEmpty(imagenAnterior))
            _imagenService.EliminarImagenProducto(imagenAnterior);

        return ToDto(actualizado);
    }

    public async Task<bool> EliminarImagenAsync(int id)
    {
        var producto = await _repo.ObtenerPorIdAsync(id);
        if (producto is null) return false;
        if (string.IsNullOrEmpty(producto.ImagenUrl)) return true;

        var imagenAnterior = producto.ImagenUrl;
        var actualizado = await _repo.ActualizarImagenAsync(id, null);
        if (actualizado is null) return false;

        _imagenService.EliminarImagenProducto(imagenAnterior);
        return true;
    }

    public async Task<bool> EliminarAsync(int id)
        => await _repo.EliminarAsync(id);

    private static ProductoResponseDto ToDto(Producto p) =>
        new(p.IdProducto, p.Nombre, p.Descripcion, p.Codigo,
            p.PrecioUnitario, p.Stock, p.CalibreMn, p.IdCategoria, p.Categoria.Nombre, p.ImagenUrl);
}
