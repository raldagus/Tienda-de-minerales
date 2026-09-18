import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AdminPedidos } from './admin-pedidos';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

const url = `${environment.apiUrl}/api/pedidos`;

const pedidoApi = {
  id: 1,
  numeroPedido: 'AAAA',
  nombreComprador: 'Juan',
  estado: 'Pendiente',
  total: 3500,
  fechaCreacion: '2026-09-16T10:00:00Z',
  items: [{ productoId: 3, nombreProducto: 'Cuarzo Rosa', cantidad: 1, precioUnitario: 3500 }],
};

describe('AdminPedidos', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AdminPedidos],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function crear() {
    const fixture = TestBed.createComponent(AdminPedidos);
    fixture.detectChanges();
    return fixture;
  }

  it('carga el listado al iniciar, sin filtro, y lo muestra', () => {
    const fixture = crear();

    const peticion = httpMock.expectOne((r) => r.url === url);
    expect(peticion.request.params.has('estado')).toBe(false);
    expect(fixture.componentInstance.cargando()).toBe(true);
    peticion.flush([pedidoApi]);
    fixture.detectChanges();

    expect(fixture.componentInstance.cargando()).toBe(false);
    expect(fixture.componentInstance.pedidos().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('AAAA');
    expect(fixture.nativeElement.textContent).toContain('Juan');
  });

  it('muestra un aviso cuando no hay pedidos', () => {
    const fixture = crear();

    httpMock.expectOne((r) => r.url === url).flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay pedidos');
  });

  it('al cambiar el filtro vuelve a pedir el listado con ese estado', () => {
    const fixture = crear();
    httpMock.expectOne((r) => r.url === url).flush([]);

    fixture.componentInstance.cambiarFiltro('Pendiente');

    const peticion = httpMock.expectOne((r) => r.url === url);
    expect(peticion.request.params.get('estado')).toBe('Pendiente');
    expect(fixture.componentInstance.filtro()).toBe('Pendiente');
    peticion.flush([]);
  });

  it('descarta la respuesta vieja si el filtro cambia antes de que llegue', () => {
    const fixture = crear();
    const primera = httpMock.expectOne((r) => r.url === url);

    fixture.componentInstance.cambiarFiltro('Confirmado');
    const segunda = httpMock.expectOne((r) => r.url === url && r.params.get('estado') === 'Confirmado');
    segunda.flush([{ ...pedidoApi, numeroPedido: 'CCCC', estado: 'Confirmado' }]);

    expect(primera.cancelled).toBe(true);
    expect(fixture.componentInstance.pedidos().map((p) => p.numeroPedido)).toEqual(['CCCC']);
  });

  it('ante un error muestra un mensaje y no deja el spinner colgado', () => {
    const fixture = crear();

    httpMock.expectOne((r) => r.url === url).flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.cargando()).toBe(false);
    expect(fixture.componentInstance.error()).toBeTruthy();
  });

  describe('acciones', () => {
    function botones(fixture: ReturnType<typeof crear>, clase: string): HTMLButtonElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll(`.${clase}`));
    }

    function crearConLista(pedidos: unknown[]) {
      const fixture = crear();
      httpMock.expectOne((r) => r.url === url).flush(pedidos);
      fixture.detectChanges();
      return fixture;
    }

    it('muestra confirmar y cancelar solo en los pedidos pendientes', () => {
      const fixture = crearConLista([
        pedidoApi,
        { ...pedidoApi, id: 2, numeroPedido: 'BBBB', estado: 'Confirmado' },
      ]);

      expect(botones(fixture, 'admin-pedidos__confirmar').length).toBe(1);
      expect(botones(fixture, 'admin-pedidos__cancelar').length).toBe(1);
    });

    it('confirmar deshabilita ambos botones mientras el request esta en vuelo y despues refresca el listado', () => {
      const fixture = crearConLista([pedidoApi]);

      botones(fixture, 'admin-pedidos__confirmar')[0].click();
      fixture.detectChanges();

      expect(botones(fixture, 'admin-pedidos__confirmar')[0].disabled).toBe(true);
      expect(botones(fixture, 'admin-pedidos__cancelar')[0].disabled).toBe(true);

      httpMock.expectOne(`${url}/1/confirmar`).flush({ ...pedidoApi, estado: 'Confirmado' });
      httpMock.expectOne((r) => r.url === url).flush([{ ...pedidoApi, estado: 'Confirmado' }]);
      fixture.detectChanges();

      expect(botones(fixture, 'admin-pedidos__confirmar').length).toBe(0);
      expect(fixture.componentInstance.errorAccion()).toBeNull();
    });

    it('cancelar hace POST a cancelar y refresca el listado', () => {
      const fixture = crearConLista([pedidoApi]);

      botones(fixture, 'admin-pedidos__cancelar')[0].click();
      httpMock.expectOne(`${url}/1/cancelar`).flush({ ...pedidoApi, estado: 'Cancelado' });

      httpMock.expectOne((r) => r.url === url).flush([]);
    });

    it('ante un 409 muestra el mensaje del backend tal cual y refresca el listado', () => {
      const fixture = crearConLista([pedidoApi]);
      const mensaje = 'No se puede pasar de "Expirado" a "Confirmado".';

      botones(fixture, 'admin-pedidos__confirmar')[0].click();
      httpMock.expectOne(`${url}/1/confirmar`).flush({ mensaje }, { status: 409, statusText: 'Conflict' });
      httpMock.expectOne((r) => r.url === url).flush([{ ...pedidoApi, estado: 'Expirado' }]);
      fixture.detectChanges();

      expect(fixture.componentInstance.errorAccion()).toBe(mensaje);
      expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(mensaje);
      expect(fixture.componentInstance.pedidos()[0].estado).toBe('Expirado');
      expect(botones(fixture, 'admin-pedidos__confirmar').length).toBe(0);
    });

    it('ante otro error muestra un mensaje generico, rehabilita los botones y no refresca', () => {
      const fixture = crearConLista([pedidoApi]);

      botones(fixture, 'admin-pedidos__confirmar')[0].click();
      httpMock.expectOne(`${url}/1/confirmar`).flush({}, { status: 500, statusText: 'Server Error' });
      fixture.detectChanges();

      expect(fixture.componentInstance.errorAccion()).toBeTruthy();
      expect(botones(fixture, 'admin-pedidos__confirmar')[0].disabled).toBe(false);
    });

    it('ante un 401 en una accion cierra la sesion y redirige al login', () => {
      const logout = vi.spyOn(TestBed.inject(AuthService), 'logout');
      const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const fixture = crearConLista([pedidoApi]);

      botones(fixture, 'admin-pedidos__cancelar')[0].click();
      httpMock.expectOne(`${url}/1/cancelar`).flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(logout).toHaveBeenCalled();
      expect(navegar).toHaveBeenCalledWith('/admin/login');
    });

    it('limpia el error de la accion anterior al iniciar una nueva', () => {
      const fixture = crearConLista([pedidoApi]);
      botones(fixture, 'admin-pedidos__confirmar')[0].click();
      httpMock.expectOne(`${url}/1/confirmar`).flush({}, { status: 500, statusText: 'Server Error' });
      fixture.detectChanges();

      botones(fixture, 'admin-pedidos__cancelar')[0].click();

      expect(fixture.componentInstance.errorAccion()).toBeNull();
      httpMock.expectOne(`${url}/1/cancelar`);
    });
  });

  it('ante un 401 cierra la sesion y redirige al login', () => {
    const authService = TestBed.inject(AuthService);
    const logout = vi.spyOn(authService, 'logout');
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = crear();

    httpMock.expectOne((r) => r.url === url).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(logout).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith('/admin/login');
    expect(fixture.componentInstance.cargando()).toBe(false);
  });
});
