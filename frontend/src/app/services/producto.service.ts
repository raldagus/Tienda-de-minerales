import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private _piedras = signal<Producto[]>([]);
  private _cargando = signal(false);
  private _error = signal<string | null>(null);

  readonly piedras = this._piedras.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  readonly destacadas = computed(() => this._piedras().slice(0, 4));

  cargar(): void {
    this._cargando.set(true);
    this._error.set(null);

    this.http.get<Producto[]>(`${this.baseUrl}/api/productos`).subscribe({
      next: data => {
        this._piedras.set(data);
        this._cargando.set(false);
      },
      error: err => {
        this._error.set('No se pudieron cargar las piedras.');
        this._cargando.set(false);
        console.error(err);
      }
    });
  }

  urlImagen(p: Producto): string {
    return p.imagenUrl
  ? `${this.baseUrl}${p.imagenUrl}`
  : 'catalogo-piedras/placeholder.jpg';
  }
}