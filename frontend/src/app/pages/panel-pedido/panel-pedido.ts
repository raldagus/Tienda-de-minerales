import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-panel-pedido',
  imports: [FormsModule],
  templateUrl: './panel-pedido.html',
  styleUrl: './panel-pedido.scss',
})
export class PanelPedido {
  protected pedidoService = inject(PedidoService);
  protected productoService = inject(ProductoService);

  nombre = signal('');
  email = signal('');
  telefono = signal('');
  direccion = signal('');

  constructor() {
    effect(() => {
      document.body.style.overflow = this.pedidoService.estaAbierto() ? 'hidden' : '';
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.pedidoService.estaAbierto()) {
      this.pedidoService.cerrarPanel();
    }
  }

  confirmar(): void {
    this.pedidoService.confirmarPedido({
      nombre: this.nombre(),
      email: this.email(),
      telefono: this.telefono() || undefined,
      direccion: this.direccion() || undefined,
    });
  }
}
