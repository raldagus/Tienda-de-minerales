import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  it('permite el acceso si hay sesion activa', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { estaAutenticado: () => true } }],
    });

    const resultado = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(resultado).toBe(true);
  });

  it('redirige a /admin/login si no hay sesion', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { estaAutenticado: () => false } }],
    });

    const resultado = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    const router = TestBed.inject(Router);
    expect(resultado).toEqual(router.createUrlTree(['/admin/login']));
  });
});
