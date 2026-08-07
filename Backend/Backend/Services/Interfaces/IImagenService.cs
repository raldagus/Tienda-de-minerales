namespace TiendaApi.Services.Interfaces;

public interface IImagenService
{
    Task<string> GuardarImagenProductoAsync(IFormFile archivo, int idProducto);
    void EliminarImagenProducto(string rutaRelativa);
}
