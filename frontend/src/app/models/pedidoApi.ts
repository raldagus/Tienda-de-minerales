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

export interface PedidoItemResponseApiDto {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoResponseApiDto {
  id: number;
  numeroPedido: string;
  nombreComprador: string;
  estado: string;
  total: number;
  fechaCreacion: string;
  items: PedidoItemResponseApiDto[];
}

export interface PedidoCreadoApiDto {
  pedidoId: number;
  numeroPedido: string;
  mensajeWhatsApp: string;
}
