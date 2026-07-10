export type Variedad = 'Cuarzo' | 'Turmalina' | 'Ágata' | 'Otras piedras';
export type Tipo = 'calibrada' | 'bruto';

export interface Piedra {
  id: string;
  nombre: string;
  variedad: Variedad;
  tipo?: Tipo;
  calibreMm?: number;
  precio: number;
  imagen: string;
  colorTag: 'agata' | 'malaquita';
  descripcion?: string;
}

export interface ItemPedido {
  piedra: Piedra;
  cantidad: number;
}
