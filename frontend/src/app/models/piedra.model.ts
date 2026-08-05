export type Variedad = 'Cuarzo' | 'Turmalina' | 'Ágata' | 'Labradorita' | 'Lapislazuli' | 'Piedra de la luna' | 'Obsidiana' | 'Opalo' | 'Otras piedras';
export type Tipo = 'calibrada' | 'bruto';

export interface Piedra {
  id: string;
  nombre: Variedad;
  descripcion: string;
  categoriaNombre?: Tipo;
  calibreMm?: number;
  precio: number;
  imagen: string;
}

export interface ItemPedido {
  piedra: Piedra;
  cantidad: number;
}
