import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { PiedraService } from '../../services/piedra.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected pedidoService = inject(PedidoService);
  private piedraService = inject(PiedraService);

  catalogo = computed(() => this.piedraService.piedras().slice(0, 4));
   }