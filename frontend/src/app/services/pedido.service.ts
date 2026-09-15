import { Injectable, signal, computed } from '@angular/core';
import { Producto, ItemPedido } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly numeroWhatsapp = '5493834778412';

  pedido = signal<ItemPedido[]>([]);
  estaAbierto = signal(false);

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  totalPedido = computed(() =>
    this.pedido().reduce((acc, item) => acc + item.producto.precioUnitario * item.cantidad, 0)
  );

  cantidadItems = computed(() =>
    this.pedido().reduce((acc, item) => acc + item.cantidad, 0)
  );

  /**
   * Agrega el producto al carrito, recortando la cantidad al disponible
   * (Stock - StockReservado que calcula la API), no al stock físico.
   * Sin disponible, no hay excepción: devuelve false y deja el motivo en `error`.
   */
  agregarAlPedido(producto: Producto, cantidad: number = 1): boolean {
    const actual = this.pedido();
    const existente = actual.find((i) => i.producto.id === producto.id);
    const cantidadActual = existente?.cantidad ?? 0;
    const disponibleRestante = producto.disponible - cantidadActual;

    if (disponibleRestante <= 0) {
      this._error.set(`No queda stock disponible de "${producto.nombre}".`);
      return false;
    }

    const cantidadAAgregar = Math.min(cantidad, disponibleRestante);

    if (existente) {
      this.pedido.set(
        actual.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + cantidadAAgregar } : i
        )
      );
    } else {
      this.pedido.set([...actual, { producto, cantidad: cantidadAAgregar }]);
    }

    this._error.set(null);
    return true;
  }

  quitarDelPedido(productoId: number): void {
    this.pedido.set(this.pedido().filter((i) => i.producto.id !== productoId));
  }

  cantidadEnPedido(productoId: number): number {
    return this.pedido().find((i) => i.producto.id === productoId)?.cantidad ?? 0;
  }

  alcanzoStockMaximo(producto: Producto): boolean {
    return this.cantidadEnPedido(producto.id) >= producto.disponible;
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
