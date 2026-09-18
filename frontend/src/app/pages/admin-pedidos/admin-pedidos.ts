import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
