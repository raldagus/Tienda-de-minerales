import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { EstadoPedido, PedidoAdmin } from '../models/pedido.model';
import { PedidoResponseApiDto } from '../models/pedidoApi';

@Injectable({ providedIn: 'root' })
export class PedidoAdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** El backend ya devuelve los pedidos ordenados por fecha de creación descendente. */
  listar(estado?: EstadoPedido): Observable<PedidoAdmin[]> {
    const params = estado ? new HttpParams().set('estado', estado) : new HttpParams();

    return this.http
      .get<PedidoResponseApiDto[]>(`${this.baseUrl}/api/pedidos`, { params })
      .pipe(map((pedidos) => pedidos.map(mapearPedido)));
  }
}

function mapearPedido(dto: PedidoResponseApiDto): PedidoAdmin {
  return {
    id: dto.id,
    numeroPedido: dto.numeroPedido,
    nombreComprador: dto.nombreComprador,
    estado: dto.estado as EstadoPedido,
    total: dto.total,
    fechaCreacion: new Date(dto.fechaCreacion),
    items: dto.items,
  };
}
