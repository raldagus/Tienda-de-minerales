import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected pedidoService = inject(PedidoService);
}
