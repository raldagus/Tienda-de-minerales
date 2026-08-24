import { Component, OnInit, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-vista-individual',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vista-individual.html',
  styleUrl: './vista-individual.scss'
})
export class VistaIndividual implements OnInit {
  private route = inject(ActivatedRoute);
  protected productoService = inject(ProductoService);
  private pedidoService = inject(PedidoService);
  private platformId = inject(PLATFORM_ID);

  producto = signal<Producto | null>(null);
  cargando = signal(true);
  error = signal(false);
  cantidad = signal(1);
  agregado = signal(false);

  maximo = computed(() => {
    const p = this.producto();
    if (!p) return 1;
    return Math.min(p.stock ?? 1, 99);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) {
        this.error.set(true);
        this.cargando.set(false);
        return;
      }
      this.cantidad.set(1);
     this.cargarProducto(id);
    });
  }

  private cargarProducto(id: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.cargando.set(true);
    this.error.set(false);

    this.productoService.obtenerPorId(id).subscribe({
      next: (p) => {
        this.producto.set(p);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }

  aumentar(): void {
    if (this.cantidad() < this.maximo()) {
      this.cantidad.update(c => c + 1);
    }
  }

  disminuir(): void {
    if (this.cantidad() > 1) {
      this.cantidad.update(c => c - 1);
    }
  }

  agregarAlPedido(): void {
    const p = this.producto();
    if (!p) return;

    this.pedidoService.agregarAlPedido(p, this.cantidad());
    this.agregado.set(true);
    setTimeout(() => this.agregado.set(false), 2500);
  }
}