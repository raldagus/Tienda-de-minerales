import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Piedra } from '../../models/piedra.model';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected pedidoService = inject(PedidoService);

  // --- Datos del catálogo ---
  // Reemplazar `imagen` por las rutas reales en /assets/piedras/
  catalogo = signal<Piedra[]>([
    {
      id: 'agata-azul-20',
      nombre: 'Ágata Azul',
      variedad: 'Ágata',
      calibreMm: 20,
      precio: 4500,
      imagen: 'assets/piedras/agata-azul.jpg',
      colorTag: 'agata',
      descripcion: 'Corte pulido con bandas concéntricas azul profundo.',
    },
    {
      id: 'agata-verde-18',
      nombre: 'Ágata Verde',
      variedad: 'Ágata',
      calibreMm: 18,
      precio: 4200,
      imagen: 'assets/piedras/agata-verde.jpg',
      colorTag: 'malaquita',
      descripcion: 'Tonalidad verde musgo con núcleo cristalino.',
    },
    {
      id: 'cuarzo-blanco-22',
      nombre: 'Cuarzo Blanco',
      variedad: 'Cuarzo',
      calibreMm: 22,
      precio: 3800,
      imagen: 'assets/piedras/cuarzo-blanco.jpg',
      colorTag: 'agata',
      descripcion: 'Transparencia lechosa, ideal para joyería fina.',
    },
    {
      id: 'agata-fucsia-19',
      nombre: 'Ágata Fucsia',
      variedad: 'Ágata',
      calibreMm: 19,
      precio: 4700,
      imagen: 'assets/piedras/agata-fucsia.jpg',
      colorTag: 'malaquita',
      descripcion: 'Coloración teñida fucsia con bandas onduladas.',
    },
  ]);

  // Pieza destacada (sección "detalle" tipo la referencia)
  destacada = computed(() => this.catalogo()[0]);
}
