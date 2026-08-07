using Microsoft.AspNetCore.Mvc;
using TiendaApi.DTOs;
using TiendaApi.Services.Interfaces;

namespace TiendaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _service;

    public ProductosController(IProductoService service)
    {
        _service = service;
    }

    /// <summary>Obtiene todos los productos activos. Filtro opcional por categoría.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductoResponseDto>>> ObtenerTodos(
        [FromQuery] int? idCategoria = null)
    {
        var productos = await _service.ObtenerTodosAsync(idCategoria);
        return Ok(productos);
    }

    /// <summary>Obtiene un producto por su ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductoResponseDto>> ObtenerPorId(int id)
    {
        var producto = await _service.ObtenerPorIdAsync(id);
        return producto is null ? NotFound() : Ok(producto);
    }

    /// <summary>Crea un nuevo producto.</summary>
    [HttpPost]
    public async Task<ActionResult<ProductoResponseDto>> Agregar(ProductoCrearDto dto)
    {
        try
        {
            var resultado = await _service.AgregarAsync(dto);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.IdProducto }, resultado);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }

    /// <summary>Modifica un producto existente.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductoResponseDto>> Modificar(int id, ProductoEditarDto dto)
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

    /// <summary>Elimina lógicamente un producto (borrado lógico).</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var eliminado = await _service.EliminarAsync(id);
        return eliminado ? NoContent() : NotFound();
    }

    /// <summary>Sube o reemplaza la imagen demostrativa de un producto.</summary>
    [HttpPost("{id:int}/imagen")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5_242_880)]
    public async Task<ActionResult<ProductoResponseDto>> SubirImagen(int id, [FromForm] IFormFile archivo)
    {
        try
        {
            var resultado = await _service.SubirImagenAsync(id, archivo);
            return resultado is null ? NotFound() : Ok(resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    /// <summary>Elimina la imagen demostrativa de un producto.</summary>
    [HttpDelete("{id:int}/imagen")]
    public async Task<IActionResult> EliminarImagen(int id)
    {
        var eliminado = await _service.EliminarImagenAsync(id);
        return eliminado ? NoContent() : NotFound();
    }
}
