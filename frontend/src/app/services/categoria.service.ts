import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Categoria } from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/categorias`;

  categorias = signal<Categoria[]>([]);

  cargar() {
    this.http.get<Categoria[]>(this.url)
      .subscribe(data => this.categorias.set(data));
  }
}