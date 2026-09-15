import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { PedidoService } from './pedido.service';
import { Producto } from '../models/producto.model';
import { environment } from '../../environments/environment';

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
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(PedidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
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

  describe('confirmarPedido', () => {
    it('llama a POST /api/pedidos y no abre whatsapp hasta que responde', () => {
      const producto = crearProducto({ disponible: 5 });
      servicio.agregarAlPedido(producto, 2);
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

      servicio.confirmarPedido({ nombre: 'Juan Pérez', email: 'juan@mail.com' });

      const peticion = httpMock.expectOne(`${environment.apiUrl}/api/pedidos`);
      expect(peticion.request.method).toBe('POST');
      expect(peticion.request.body).toEqual({
        nombre: 'Juan Pérez',
        email: 'juan@mail.com',
        telefono: null,
        direccion: null,
        items: [{ productoId: producto.id, cantidad: 2 }],
      });
      expect(openSpy).not.toHaveBeenCalled();
      expect(servicio.enviando()).toBe(true);

      openSpy.mockRestore();
    });

    it('abre whatsapp con el mensaje del backend solo despues de un POST exitoso, y vacia el carrito', () => {
      const producto = crearProducto({ disponible: 5 });
      servicio.agregarAlPedido(producto, 2);
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

      servicio.confirmarPedido({ nombre: 'Juan Pérez', email: 'juan@mail.com' });
      const peticion = httpMock.expectOne(`${environment.apiUrl}/api/pedidos`);
      peticion.flush({ pedidoId: 1, numeroPedido: 'A7K3', mensajeWhatsApp: 'Pedido #A7K3' });

      expect(openSpy).toHaveBeenCalledTimes(1);
      expect(openSpy.mock.calls[0][0]).toContain('https://wa.me/5493834778412?text=');
      expect(openSpy.mock.calls[0][0]).toContain(encodeURIComponent('Pedido #A7K3'));
      expect(servicio.enviando()).toBe(false);
      expect(servicio.pedido()).toEqual([]);

      openSpy.mockRestore();
    });

    it('si el POST falla, no abre whatsapp, no vacia el carrito y expone el error del backend', () => {
      const producto = crearProducto({ disponible: 5 });
      servicio.agregarAlPedido(producto, 1);
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

      servicio.confirmarPedido({ nombre: 'Juan Pérez', email: 'juan@mail.com' });
      const peticion = httpMock.expectOne(`${environment.apiUrl}/api/pedidos`);
      peticion.flush(
        { mensaje: 'No hay stock suficiente de "Cuarzo rosa".' },
        { status: 400, statusText: 'Bad Request' }
      );

      expect(openSpy).not.toHaveBeenCalled();
      expect(servicio.enviando()).toBe(false);
      expect(servicio.pedido().length).toBe(1);
      expect(servicio.errorEnvio()).toBe('No hay stock suficiente de "Cuarzo rosa".');

      openSpy.mockRestore();
    });

    it('no envia nada si el carrito esta vacio', () => {
      servicio.confirmarPedido({ nombre: 'Juan Pérez', email: 'juan@mail.com' });

      httpMock.expectNone(`${environment.apiUrl}/api/pedidos`);
    });
  });
});
