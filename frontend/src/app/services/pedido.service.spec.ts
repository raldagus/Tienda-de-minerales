import { PedidoService } from './pedido.service';
import { Producto } from '../models/producto.model';

function crearProducto(overrides: Partial<Producto> = {}): Producto {
  return {
    id: 1,
    nombre: 'Cuarzo rosa',
    descripcion: '',
    precioUnitario: 4500,
    stock: 10,
    disponible: 10,
    idCategoria: 1,
    categoriaNombre: 'Cuarzos',
    imagenUrl: '',
    ...overrides,
  };
}

describe('PedidoService', () => {
  let servicio: PedidoService;

  beforeEach(() => {
    servicio = new PedidoService();
  });

  it('agrega un producto nuevo al carrito', () => {
    const producto = crearProducto({ disponible: 5 });

    const resultado = servicio.agregarAlPedido(producto, 2);

    expect(resultado).toBe(true);
    expect(servicio.cantidadEnPedido(producto.id)).toBe(2);
  });

  it('suma cantidades cuando el producto ya esta en el carrito', () => {
    const producto = crearProducto({ disponible: 5 });
    servicio.agregarAlPedido(producto, 2);

    servicio.agregarAlPedido(producto, 2);

    expect(servicio.cantidadEnPedido(producto.id)).toBe(4);
  });

  it('recorta la cantidad agregada al disponible, no al stock fisico', () => {
    const producto = crearProducto({ stock: 10, disponible: 3 });

    servicio.agregarAlPedido(producto, 8);

    expect(servicio.cantidadEnPedido(producto.id)).toBe(3);
  });

  it('no agrega mas alla del disponible aunque el stock fisico sea mayor', () => {
    const producto = crearProducto({ stock: 10, disponible: 2 });
    servicio.agregarAlPedido(producto, 2);

    const resultado = servicio.agregarAlPedido(producto, 1);

    expect(resultado).toBe(false);
    expect(servicio.cantidadEnPedido(producto.id)).toBe(2);
  });

  it('cuando no hay disponible, no lanza excepcion: devuelve false y expone el error como estado', () => {
    const producto = crearProducto({ disponible: 0 });

    expect(() => servicio.agregarAlPedido(producto)).not.toThrow();
    expect(servicio.agregarAlPedido(producto)).toBe(false);
    expect(servicio.error()).toContain(producto.nombre);
  });

  it('limpia el error tras un agregado exitoso posterior', () => {
    const agotado = crearProducto({ id: 1, disponible: 0 });
    const conStock = crearProducto({ id: 2, disponible: 5 });
    servicio.agregarAlPedido(agotado);

    servicio.agregarAlPedido(conStock, 1);

    expect(servicio.error()).toBeNull();
  });

  it('alcanzoStockMaximo compara contra el disponible', () => {
    const producto = crearProducto({ stock: 10, disponible: 2 });
    servicio.agregarAlPedido(producto, 2);

    expect(servicio.alcanzoStockMaximo(producto)).toBe(true);
  });
});
