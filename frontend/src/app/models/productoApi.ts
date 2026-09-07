export interface ProductoApi {
  idProducto: number;
  nombre: string;
  descripcion: string | null;
  codigo: string;
  precioUnitario: number;
  stock: number;
  calibreMm: number | null;
  idCategoria: number;
  nombreCategoria: string;
  imagenUrl: string;
}