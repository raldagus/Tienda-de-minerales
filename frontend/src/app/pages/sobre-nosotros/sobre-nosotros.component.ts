import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FotoCarrusel {
  src: string;
  alt: string;
  pie: string; 
}

@Component({
  selector: 'app-sobre-nosotros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sobre-nosotros.component.html',
  styleUrl: './sobre-nosotros.component.scss'
})
export class SobreNosotrosComponent implements OnDestroy {

  fotos = signal<FotoCarrusel[]>([
    { src: 'imagenes/piedra-bruto.png', alt: 'Seleccion de piedra', pie: 'Piedra en bruto' },
    { src: 'imagenes/proceso3.png', alt: 'Pulido manual de una piedra', pie: 'El pulido' },
    { src: 'imagenes/proceso5.png', alt: 'Piedra terminada y calibrada', pie: 'El resultado' },
  ]);

  indiceActual = signal(0);
  private intervalo: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.iniciarAutoplay();
  }

  irA(indice: number): void {
    this.indiceActual.set(indice);
    this.reiniciarAutoplay();
  }

  anterior(): void {
    const total = this.fotos().length;
    this.indiceActual.set((this.indiceActual() - 1 + total) % total);
    this.reiniciarAutoplay();
  }

  siguiente(): void {
    const total = this.fotos().length;
    this.indiceActual.set((this.indiceActual() + 1) % total);
    this.reiniciarAutoplay();
  }

  private iniciarAutoplay(): void {
    this.intervalo = setInterval(() => {
      const total = this.fotos().length;
      this.indiceActual.set((this.indiceActual() + 1) % total);
    }, 5000);
  }

  private reiniciarAutoplay(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
    this.iniciarAutoplay();
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }
}
