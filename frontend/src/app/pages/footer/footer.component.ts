import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  anioActual = new Date().getFullYear();

   numeroWhatsapp = '5493834778412';

  linkWhatsapp(): string {
    const mensaje = 'Hola! Tengo una consulta sobre el catálogo de piedras.';
    return `https://wa.me/${this.numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`;
  }
}
