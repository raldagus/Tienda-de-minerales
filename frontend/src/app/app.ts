import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './pages/Header/header';
import { PanelPedido } from './pages/panel-pedido/panel-pedido';
import { FooterComponent } from './pages/footer/footer.component';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, PanelPedido, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');
}
