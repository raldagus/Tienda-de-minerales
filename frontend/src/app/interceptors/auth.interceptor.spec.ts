import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  function ejecutar(token: string | null, url: string): HttpRequest<unknown> {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { token: () => token } }],
    });

    const req = new HttpRequest('GET', url);
    let reqInterceptada!: HttpRequest<unknown>;
    const next = (r: HttpRequest<unknown>) => {
      reqInterceptada = r;
      return of({} as any);
    };

    TestBed.runInInjectionContext(() => authInterceptor(req, next as any));
    return reqInterceptada;
  }

  it('agrega el header Authorization cuando hay token y la url es de la API', () => {
    const req = ejecutar('un-token', `${environment.apiUrl}/api/pedidos`);

    expect(req.headers.get('Authorization')).toBe('Bearer un-token');
  });

  it('no agrega el header si no hay token', () => {
    const req = ejecutar(null, `${environment.apiUrl}/api/pedidos`);

    expect(req.headers.has('Authorization')).toBe(false);
  });

  it('no agrega el header si la url no pertenece a la API', () => {
    const req = ejecutar('un-token', 'https://otro-dominio.com/recurso');

    expect(req.headers.has('Authorization')).toBe(false);
  });
});
