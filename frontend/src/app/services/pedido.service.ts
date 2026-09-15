import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto, ItemPedido } from '../models/producto.model';
import { DatosComprador } from '../models/pedido.model';
import { CrearPedidoApiDto, PedidoCreadoApiDto } from '../models/pedidoApi';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly numeroWhatsapp = '5493834778412';

  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  pedido = signal<ItemPedido[]>([]);
  estaAbierto = signal(false);

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  private _enviando = signal(false);
  readonly enviando = this._enviando.asReadonly();

  private _errorEnvio = signal<string | null>(null);
  readonly errorEnvio = this._errorEnvio.asReadonly();

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

  /**
   * Orden crítico: primero POST /api/pedidos, y solo si responde OK se abre
   * WhatsApp con el mensaje que arma el backend. Si el POST falla (sin stock,
   * error de red, etc.) no se abre WhatsApp y el carrito no se vacía: el
   * motivo queda en `errorEnvio`, un estado normal de la UI, no una excepción.
   */
  confirmarPedido(datos: DatosComprador): void {
    if (this.pedido().length === 0) return;

    this._enviando.set(true);
    this._errorEnvio.set(null);

    const body: CrearPedidoApiDto = {
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono || null,
      direccion: datos.direccion || null,
      items: this.pedido().map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
    };

    this.http.post<PedidoCreadoApiDto>(`${this.baseUrl}/api/pedidos`, body).subscribe({
      next: (resultado) => {
        this._enviando.set(false);
        this.pedido.set([]);
        this.abrirWhatsapp(resultado.mensajeWhatsApp);
      },
      error: (err) => {
        this._enviando.set(false);
        this._errorEnvio.set(err?.error?.mensaje ?? 'No pudimos registrar el pedido. Intentá de nuevo.');
      },
    });
  }

  private abrirWhatsapp(mensaje: string): void {
    window.open(`https://wa.me/${this.numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }
}
