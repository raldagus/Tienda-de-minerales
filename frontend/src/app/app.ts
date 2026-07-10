import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './pages/Header/header';
import { PanelPedido } from './shared/panel-pedido/panel-pedido';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, PanelPedido],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');
}
