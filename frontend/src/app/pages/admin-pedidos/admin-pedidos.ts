import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PedidoAdminService } from '../../services/pedido-admin.service';
import { ESTADOS_PEDIDO, EstadoPedido, PedidoAdmin } from '../../models/pedido.model';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [],
  templateUrl: './admin-pedidos.html',
  styleUrl: './admin-pedidos.scss',
})
export class AdminPedidos implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private pedidoAdminService = inject(PedidoAdminService);
  private router = inject(Router);
  private suscripcion?: Subscription;

  readonly estados = ESTADOS_PEDIDO;

  pedidos = signal<PedidoAdmin[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  filtro = signal<EstadoPedido | ''>('');
  enCurso = signal<ReadonlySet<number>>(new Set());
  errorAccion = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  cambiarFiltro(estado: EstadoPedido | ''): void {
    this.filtro.set(estado);
    this.cargar();
  }

  cargar(): void {
    this.suscripcion?.unsubscribe();
    this.cargando.set(true);
    this.error.set(null);

    this.suscripcion = this.pedidoAdminService.listar(this.filtro() || undefined).subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err?.status === 401) {
          this.cerrarSesion();
          return;
        }
        this.error.set('No se pudieron cargar los pedidos. Intentá de nuevo.');
      },
    });
  }

  confirmar(pedido: PedidoAdmin): void {
    this.ejecutarAccion(pedido, this.pedidoAdminService.confirmar(pedido.id));
  }

  cancelar(pedido: PedidoAdmin): void {
    this.ejecutarAccion(pedido, this.pedidoAdminService.cancelar(pedido.id));
  }

  estaEnCurso(pedido: PedidoAdmin): boolean {
    return this.enCurso().has(pedido.id);
  }

  private ejecutarAccion(pedido: PedidoAdmin, accion: Observable<PedidoAdmin>): void {
    if (this.estaEnCurso(pedido)) return;

    this.errorAccion.set(null);
    this.marcarEnCurso(pedido.id, true);

    accion.subscribe({
      next: () => {
        this.marcarEnCurso(pedido.id, false);
        this.cargar();
      },
      error: (err) => {
        this.marcarEnCurso(pedido.id, false);
        if (err?.status === 401) {
          this.cerrarSesion();
          return;
        }
        if (err?.status === 409) {
          // El pedido cambió de estado por otro lado (p. ej. expiró): se muestra el motivo del backend y se actualiza la lista.
          this.errorAccion.set(err.error?.mensaje ?? 'El pedido ya cambió de estado.');
          this.cargar();
          return;
        }
        this.errorAccion.set('No se pudo completar la acción. Intentá de nuevo.');
      },
    });
  }

  private marcarEnCurso(id: number, enCurso: boolean): void {
    this.enCurso.update((ids) => {
      const nuevos = new Set(ids);
      enCurso ? nuevos.add(id) : nuevos.delete(id);
      return nuevos;
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigateByUrl('/admin/login');
  }

  formatoMonto(monto: number): string {
    return `$${monto.toLocaleString('es-AR')}`;
  }

  formatoFecha(fecha: Date): string {
    return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  }
}
