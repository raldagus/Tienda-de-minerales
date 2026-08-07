using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaApi.Data;

namespace TiendaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly TiendaDbContext _db;

    public HealthController(TiendaDbContext db)
    {
        _db = db;
    }

    /// <summary>Verifica que la API y la base de datos estén operativas.</summary>
    [HttpGet]
    public async Task<IActionResult> Check()
    {
        var conteo = await _db.Categorias.CountAsync();
        return Ok(new
        {
            estado = "ok",
            db = "conectada",
            categorias = conteo,
            timestamp = DateTime.UtcNow
        });
    }
}
