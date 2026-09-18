import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginApiDto, LoginResponseApiDto } from '../models/authApi';

const CLAVE_TOKEN = 'tienda_admin_token';
const CLAVE_EXPIRA = 'tienda_admin_expira';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private _token = signal<string | null>(this.leerSesionVigente());
  readonly estaAutenticado = computed(() => this._token() !== null);

  login(usuario: string, password: string): Observable<LoginResponseApiDto> {
    const body: LoginApiDto = { usuario, password };
    return this.http
      .post<LoginResponseApiDto>(`${this.baseUrl}/api/auth/login`, body)
      .pipe(tap((resultado) => this.guardarSesion(resultado)));
  }

  logout(): void {
    this._token.set(null);
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_EXPIRA);
  }

  token(): string | null {
    return this._token();
  }

  private guardarSesion(resultado: LoginResponseApiDto): void {
    this._token.set(resultado.token);
    localStorage.setItem(CLAVE_TOKEN, resultado.token);
    localStorage.setItem(CLAVE_EXPIRA, resultado.expiraEn);
  }

  private leerSesionVigente(): string | null {
    const token = localStorage.getItem(CLAVE_TOKEN);
    const expira = localStorage.getItem(CLAVE_EXPIRA);

    if (!token || !expira || new Date(expira) <= new Date()) {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_EXPIRA);
      return null;
    }

    return token;
  }
}
