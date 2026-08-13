import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected pedidoService = inject(PedidoService);
  protected productoService = inject(ProductoService);
  private platformId = inject(PLATFORM_ID);

  catalogo = this.productoService.destacadas;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.productoService.cargar();
    }
  }
}