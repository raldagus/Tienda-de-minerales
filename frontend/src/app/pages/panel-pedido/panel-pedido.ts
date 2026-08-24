import { Component, effect, HostListener, inject } from '@angular/core';
import { PedidoService } from '../../services/pedido.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-panel-pedido',
  imports: [],
  templateUrl: './panel-pedido.html',
  styleUrl: './panel-pedido.scss',
})
export class PanelPedido {
  protected pedidoService = inject(PedidoService);
  protected productoService = inject(ProductoService);

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
}
