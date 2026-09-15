export interface CrearPedidoItemApiDto {
  productoId: number;
  cantidad: number;
}

export interface CrearPedidoApiDto {
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  items: CrearPedidoItemApiDto[];
}

export interface PedidoCreadoApiDto {
  pedidoId: number;
  numeroPedido: string;
  mensajeWhatsApp: string;
}
