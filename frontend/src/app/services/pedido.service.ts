import { Injectable, signal, computed } from '@angular/core';
import { Producto, ItemPedido } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly numeroWhatsapp = '5493834778412';

  pedido = signal<ItemPedido[]>([]);
  estaAbierto = signal(false);

  totalPedido = computed(() =>
    this.pedido().reduce((acc, item) => acc + item.producto.precioUnitario * item.cantidad, 0)
  );

  cantidadItems = computed(() =>
    this.pedido().reduce((acc, item) => acc + item.cantidad, 0)
  );

  agregarAlPedido(producto: Producto, cantidad: number = 1): void {
    const actual = this.pedido();
    const existente = actual.find((i) => i.producto.id === producto.id);
    const cantidadActual = existente?.cantidad ?? 0;
    const cantidadAAgregar = Math.min(cantidad, producto.stock - cantidadActual);

    if (cantidadAAgregar <= 0) return;

    if (existente) {
      this.pedido.set(
        actual.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + cantidadAAgregar } : i
        )
      );
    } else {
      this.pedido.set([...actual, { producto, cantidad: cantidadAAgregar }]);
    }
  }

  quitarDelPedido(productoId: number): void {
    this.pedido.set(this.pedido().filter((i) => i.producto.id !== productoId));
  }

  cantidadEnPedido(productoId: number): number {
    return this.pedido().find((i) => i.producto.id === productoId)?.cantidad ?? 0;
  }

  alcanzoStockMaximo(producto: Producto): boolean {
    return this.cantidadEnPedido(producto.id) >= producto.stock;
  }

  abrirPanel(): void {
    this.estaAbierto.set(true);
  }

  cerrarPanel(): void {
    this.estaAbierto.set(false);
  }

  togglePanel(): void {
    this.estaAbierto.set(!this.estaAbierto());
  }

  linkPedidoWhatsapp(): string {
    const lineas = this.pedido().map((i) => {
      const calibre = i.producto.calibreMm ? ` (${i.producto.calibreMm}mm)` : '';
      return `• ${i.cantidad}x ${i.producto.nombre}${calibre} - $${i.producto.precioUnitario * i.cantidad}`;
    });
    const mensaje = `Hola! Quiero confirmar este pedido:\n\n${lineas.join('\n')}\n\nTotal: $${this.totalPedido()}`;

    return `https://wa.me/${this.numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`;
  }
}
