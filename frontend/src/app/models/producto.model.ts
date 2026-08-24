export type Variedad = 'Cuarzo' | 'Turmalina' | 'Ágata' | 'Labradorita' | 'Lapislazuli' | 'Piedra de la luna' | 'Obsidiana' | 'Opalo' | 'Otras piedras';
export type Tipo = 'calibrada' | 'bruto';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  stock: number;
  calibreMm?: number;
  idCategoria: number;
  categoriaNombre: string;
  tipo?: Tipo;
  imagenUrl: string;
  variedad?: Variedad;
}

export interface ItemPedido {
  producto: Producto;
  cantidad: number;
}
