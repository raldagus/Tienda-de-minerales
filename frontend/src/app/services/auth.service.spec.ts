import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function crearServicio(): AuthService {
    return TestBed.inject(AuthService);
  }

  it('no esta autenticado si no hay sesion guardada', () => {
    const servicio = crearServicio();

    expect(servicio.estaAutenticado()).toBe(false);
    expect(servicio.token()).toBeNull();
  });

  it('login exitoso guarda el token y marca la sesion como autenticada', () => {
    const servicio = crearServicio();
    const expiraEn = new Date(Date.now() + 60_000).toISOString();

    servicio.login('admin', 'Secreta123!').subscribe();

    const peticion = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({ usuario: 'admin', password: 'Secreta123!' });
    peticion.flush({ token: 'un-token', expiraEn });

    expect(servicio.estaAutenticado()).toBe(true);
    expect(servicio.token()).toBe('un-token');
    expect(localStorage.getItem('tienda_admin_token')).toBe('un-token');
  });

  it('si el login falla, no guarda nada y el error se propaga a quien se suscribe', () => {
    const servicio = crearServicio();
    let errorRecibido: any;

    servicio.login('admin', 'mal').subscribe({ error: (e) => (errorRecibido = e) });

    httpMock
      .expectOne(`${environment.apiUrl}/api/auth/login`)
      .flush({ mensaje: 'Usuario o contraseña incorrectos.' }, { status: 401, statusText: 'Unauthorized' });

    expect(servicio.estaAutenticado()).toBe(false);
    expect(errorRecibido.status).toBe(401);
  });

  it('logout borra el token y la sesion guardada', () => {
    const servicio = crearServicio();
    const expiraEn = new Date(Date.now() + 60_000).toISOString();
    servicio.login('admin', 'Secreta123!').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/auth/login`).flush({ token: 'un-token', expiraEn });

    servicio.logout();

    expect(servicio.estaAutenticado()).toBe(false);
    expect(servicio.token()).toBeNull();
    expect(localStorage.getItem('tienda_admin_token')).toBeNull();
  });

  it('al crear el servicio, recupera una sesion vigente guardada en localStorage', () => {
    const expiraEn = new Date(Date.now() + 60_000).toISOString();
    localStorage.setItem('tienda_admin_token', 'token-previo');
    localStorage.setItem('tienda_admin_expira', expiraEn);

    const servicio = crearServicio();

    expect(servicio.estaAutenticado()).toBe(true);
    expect(servicio.token()).toBe('token-previo');
  });

  it('al crear el servicio, descarta una sesion guardada ya vencida', () => {
    const expiraEn = new Date(Date.now() - 60_000).toISOString();
    localStorage.setItem('tienda_admin_token', 'token-viejo');
    localStorage.setItem('tienda_admin_expira', expiraEn);

    const servicio = crearServicio();

    expect(servicio.estaAutenticado()).toBe(false);
    expect(localStorage.getItem('tienda_admin_token')).toBeNull();
  });
});
