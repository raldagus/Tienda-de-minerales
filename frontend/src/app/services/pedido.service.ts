import { Injectable, signal, computed } from '@angular/core';
import { Piedra, ItemPedido } from '../models/piedra.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly numeroWhatsapp = '5493834778412';

  pedido = signal<ItemPedido[]>([]);
  estaAbierto = signal(false);

  totalPedido = computed(() =>
    this.pedido().reduce((acc, item) => acc + item.piedra.precio * item.cantidad, 0)
  );

  cantidadItems = computed(() =>
    this.pedido().reduce((acc, item) => acc + item.cantidad, 0)
  );

  agregarAlPedido(piedra: Piedra): void {
    const actual = this.pedido();
    const existente = actual.find((i) => i.piedra.id === piedra.id);

    if (existente) {
      this.pedido.set(
        actual.map((i) => (i.piedra.id === piedra.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      );
    } else {
      this.pedido.set([...actual, { piedra, cantidad: 1 }]);
    }
  }

  quitarDelPedido(piedraId: string): void {
    this.pedido.set(this.pedido().filter((i) => i.piedra.id !== piedraId));
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
      const calibre = i.piedra.calibreMm ? ` (${i.piedra.calibreMm}mm)` : '';
      return `• ${i.cantidad}x ${i.piedra.descripcion}${calibre} - $${i.piedra.precio * i.cantidad}`;
    });
    const mensaje = `Hola! Quiero confirmar este pedido:\n\n${lineas.join('\n')}\n\nTotal: $${this.totalPedido()}`;

    return `https://wa.me/${this.numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`;
  }
}
