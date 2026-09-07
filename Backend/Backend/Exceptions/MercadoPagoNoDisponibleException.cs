namespace TiendaApi.Exceptions;

public class MercadoPagoNoDisponibleException : Exception
{
    public MercadoPagoNoDisponibleException(string message) : base(message)
    {
    }

    public MercadoPagoNoDisponibleException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
