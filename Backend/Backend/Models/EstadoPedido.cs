namespace TiendaApi.Models;

public enum EstadoPedido
{
    Pendiente,    // esperando confirmación del dueño
    Confirmado,   // stock descontado
    Cancelado,    // cancelado por el dueño, reserva liberada
    Expirado,     // venció sin respuesta, reserva liberada
    Enviado       // despachado
}
