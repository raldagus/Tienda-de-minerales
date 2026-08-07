using TiendaApi.DTOs;
using TiendaApi.Models;
using TiendaApi.Repositories.Interfaces;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Services;

public class CategoriaService : ICategoriaService
{
    private readonly ICategoriaRepository _repo;

    public CategoriaService(ICategoriaRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<CategoriaResponseDto>> ObtenerTodosAsync()
    {
        var categorias = await _repo.ObtenerTodosAsync();
        return categorias.Select(ToDto);
    }

    public async Task<CategoriaResponseDto?> ObtenerPorIdAsync(int id)
    {
        var categoria = await _repo.ObtenerPorIdAsync(id);
        return categoria is null ? null : ToDto(categoria);
    }

    public async Task<CategoriaResponseDto> AgregarAsync(CategoriaCrearDto dto)
    {
        if (await _repo.ExisteNombreAsync(dto.Nombre))
            throw new InvalidOperationException($"Ya existe una categoría con el nombre '{dto.Nombre}'.");

        var categoria = new Categoria
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion
        };

        var resultado = await _repo.AgregarAsync(categoria);
        return ToDto(resultado);
    }

    public async Task<CategoriaResponseDto?> ModificarAsync(int id, CategoriaEditarDto dto)
    {
        var categoria = await _repo.ObtenerPorIdAsync(id);
        if (categoria is null) return null;

        if (await _repo.ExisteNombreAsync(dto.Nombre, id))
            throw new InvalidOperationException($"Ya existe una categoría con el nombre '{dto.Nombre}'.");

        categoria.Nombre = dto.Nombre;
        categoria.Descripcion = dto.Descripcion;

        var resultado = await _repo.ModificarAsync(categoria);
        return ToDto(resultado);
    }

    public async Task<bool> EliminarAsync(int id)
    {
        if (await _repo.TieneProductosActivosAsync(id))
            throw new InvalidOperationException("No se puede eliminar una categoría con productos activos.");

        return await _repo.EliminarAsync(id);
    }

    private static CategoriaResponseDto ToDto(Categoria c) =>
        new(c.IdCategoria, c.Nombre, c.Descripcion);
}
