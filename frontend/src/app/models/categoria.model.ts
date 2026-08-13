export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
}

export interface CategoriaCrear {
  nombre: string;
  descripcion?: string | null;
}

export interface CategoriaModificar {
  nombre: string;
  descripcion?: string | null;
}