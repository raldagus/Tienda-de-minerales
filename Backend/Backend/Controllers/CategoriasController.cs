using Microsoft.AspNetCore.Mvc;
using TiendaApi.DTOs;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CategoriasController : ControllerBase
{
    private readonly ICategoriaService _service;

    public CategoriasController(ICategoriaService service)
    {
        _service = service;
    }

    /// <summary>Obtiene todas las categorías activas.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaResponseDto>>> ObtenerTodos()
    {
        var categorias = await _service.ObtenerTodosAsync();
        return Ok(categorias);
    }

    /// <summary>Obtiene una categoría por su ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoriaResponseDto>> ObtenerPorId(int id)
    {
        var categoria = await _service.ObtenerPorIdAsync(id);
        return categoria is null ? NotFound() : Ok(categoria);
    }

    /// <summary>Crea una nueva categoría.</summary>
    [HttpPost]
    public async Task<ActionResult<CategoriaResponseDto>> Agregar(CategoriaCrearDto dto)
    {
        try
        {
            var resultado = await _service.AgregarAsync(dto);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.IdCategoria }, resultado);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }

    /// <summary>Modifica una categoría existente.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoriaResponseDto>> Modificar(int id, CategoriaEditarDto dto)
    {
        try
        {
            var resultado = await _service.ModificarAsync(id, dto);
            return resultado is null ? NotFound() : Ok(resultado);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }

    /// <summary>Elimina lógicamente una categoría (borrado lógico).</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        try
        {
            var eliminado = await _service.EliminarAsync(id);
            return eliminado ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }
}
