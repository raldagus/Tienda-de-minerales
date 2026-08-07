using TiendaApi.Services.Interfaces;

namespace TiendaApi.Services;

public class ImagenService : IImagenService
{
    private static readonly HashSet<string> ExtensionesPermitidas = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    private static readonly HashSet<string> ContentTypesPermitidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };

    private const long TamanioMaximoBytes = 5 * 1024 * 1024;
    private const string CarpetaProductos = "uploads/productos";

    private readonly IWebHostEnvironment _env;

    public ImagenService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> GuardarImagenProductoAsync(IFormFile archivo, int idProducto)
    {
        if (archivo is null || archivo.Length == 0)
            throw new ArgumentException("El archivo de imagen es requerido.");

        if (archivo.Length > TamanioMaximoBytes)
            throw new ArgumentException("El archivo supera el tamaño máximo permitido de 5 MB.");

        var extension = Path.GetExtension(archivo.FileName);
        if (string.IsNullOrEmpty(extension) || !ExtensionesPermitidas.Contains(extension))
            throw new ArgumentException("Tipo de archivo no permitido. Use jpg, jpeg, png o webp.");

        if (!ContentTypesPermitidos.Contains(archivo.ContentType))
            throw new ArgumentException("Tipo de archivo no permitido. Use jpg, jpeg, png o webp.");

        var carpetaFisica = Path.Combine(_env.WebRootPath, CarpetaProductos);
        Directory.CreateDirectory(carpetaFisica);

        var nombreArchivo = $"{idProducto}_{Guid.NewGuid():N}{extension}";
        var rutaFisica = Path.Combine(carpetaFisica, nombreArchivo);

        await using (var stream = new FileStream(rutaFisica, FileMode.Create))
        {
            await archivo.CopyToAsync(stream);
        }

        return $"/{CarpetaProductos}/{nombreArchivo}";
    }

    public void EliminarImagenProducto(string rutaRelativa)
    {
        if (string.IsNullOrWhiteSpace(rutaRelativa)) return;

        var rutaFisica = Path.Combine(_env.WebRootPath, rutaRelativa.TrimStart('/'));
        if (File.Exists(rutaFisica))
            File.Delete(rutaFisica);
    }
}
