export interface DatosComprador {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

export type EstadoPedido = 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Expirado' | 'Enviado';

export const ESTADOS_PEDIDO: EstadoPedido[] = ['Pendiente', 'Confirmado', 'Cancelado', 'Expirado', 'Enviado'];

export interface PedidoAdminItem {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoAdmin {
  id: number;
  numeroPedido: string;
  nombreComprador: string;
  estado: EstadoPedido;
  total: number;
  fechaCreacion: Date;
  items: PedidoAdminItem[];
}
