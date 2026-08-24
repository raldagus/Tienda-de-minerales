import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Producto, Tipo } from '../models/producto.model';
import { ProductoApi } from '../models/productoApi';
import { mapearProducto, mapearProductos } from '../models/mapper';
import { Observable, map } from 'rxjs';

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


  //Carga los productos
  cargar(): void {
    this._cargando.set(true);
    this._error.set(null);

    this.http.get<ProductoApi[]>(`${this.baseUrl}/api/productos`).subscribe({
      next: data => {
        this._piedras.set(data.map(mapearProducto));
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

  obtenerPorId(id: number): Observable<Producto> {
  return this.http.get<ProductoApi>(`${this.baseUrl}/api/productos/${id}`)
    .pipe(map(dto => mapearProducto(dto)));
}
}