export type Variedad = 'Cuarzo' | 'Turmalina' | 'Ágata' | 'Labradorita' | 'Lapislazuli' | 'Piedra de la luna' | 'Obsidiana' | 'Opalo' | 'Otras piedras';
export type Tipo = 'calibrada' | 'bruto';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: Variedad;
  categoriaNombre?: Tipo;
  calibreMm?: number;
  precioUnitario: number;
  imagenUrl: string | null;
}

export interface ItemPedido {
  piedra: Producto;
  cantidad: number;
}
