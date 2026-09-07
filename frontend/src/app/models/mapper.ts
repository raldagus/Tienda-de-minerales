import { Producto, Tipo } from './producto.model';
import { ProductoApi } from './productoApi';


function normalizarTipo(nombreCategoria: string): Tipo | undefined  {
  const texto = nombreCategoria.toLowerCase();
  if (texto.includes('bruto')) return 'bruto';
  if (texto.includes('calibrada')) return 'calibrada';
  return undefined;
}


 export function mapearProducto(dto: ProductoApi): Producto {
    return {
      id: dto.idProducto,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? '',
      idCategoria: dto.idCategoria,
      categoriaNombre: dto.nombreCategoria,
      tipo: normalizarTipo(dto.nombreCategoria),
      calibreMm: dto.calibreMm ?? undefined,
      precioUnitario: dto.precioUnitario,
      stock: dto.stock,
      imagenUrl: dto.imagenUrl,
    };
  }

  export function mapearProductos(dtos: ProductoApi[]): Producto[] {
  return dtos.map(mapearProducto);
}