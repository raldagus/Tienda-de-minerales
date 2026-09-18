import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PedidoAdminService } from './pedido-admin.service';
import { PedidoAdmin } from '../models/pedido.model';
import { environment } from '../../environments/environment';

const respuesta = [
  {
    id: 2,
    numeroPedido: 'BBBB',
    nombreComprador: 'Ana',
    estado: 'Pendiente',
    total: 9000,
    fechaCreacion: '2026-09-17T15:00:00Z',
    items: [{ productoId: 3, nombreProducto: 'Cuarzo Rosa', cantidad: 2, precioUnitario: 4500 }],
  },
  {
    id: 1,
    numeroPedido: 'AAAA',
    nombreComprador: 'Juan',
    estado: 'Confirmado',
    total: 3500,
    fechaCreacion: '2026-09-16T10:00:00Z',
    items: [],
  },
];

describe('PedidoAdminService', () => {
  let servicio: PedidoAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(PedidoAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sin filtro pide GET /api/pedidos sin el parametro estado', () => {
    servicio.listar().subscribe();

    const peticion = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/api/pedidos`);
    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.params.has('estado')).toBe(false);
    peticion.flush([]);
  });

  it('con filtro manda estado como query param', () => {
    servicio.listar('Pendiente').subscribe();

    const peticion = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/api/pedidos`);
    expect(peticion.request.params.get('estado')).toBe('Pendiente');
    peticion.flush([]);
  });

  it('mapea la fecha a Date y conserva el orden que devuelve el backend (fecha descendente)', () => {
    let resultado: PedidoAdmin[] = [];

    servicio.listar().subscribe((pedidos) => (resultado = pedidos));
    httpMock.expectOne((r) => r.url === `${environment.apiUrl}/api/pedidos`).flush(respuesta);

    expect(resultado.map((p) => p.numeroPedido)).toEqual(['BBBB', 'AAAA']);
    expect(resultado[0].fechaCreacion).toBeInstanceOf(Date);
    expect(resultado[0].fechaCreacion.toISOString()).toBe('2026-09-17T15:00:00.000Z');
    expect(resultado[0].items[0].nombreProducto).toBe('Cuarzo Rosa');
  });
});
