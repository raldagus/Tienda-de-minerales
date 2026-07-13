import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PiedraSignificado {
  id: string;
  nombre: string;
  significado: string;   
  descripcion: string;
  imagen: string;
  colorTag: 'agata' | 'malaquita';
}

@Component({
  selector: 'app-diccionario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diccionario.component.html',
  styleUrl: './diccionario.component.scss'
})
export class DiccionarioComponent {

  piedras = signal<PiedraSignificado[]>([
    {
      id: 'agata',
      nombre: 'Ágata',
      significado: 'Equilibrio y estabilidad',
      descripcion: 'Reconocible por sus anillos concéntricos de colores. Asociada a la estabilidad emocional y la fuerza interior. El color específico suele sumar significados propios: azul con calma y comunicación, verde con crecimiento y prosperidad.',
      imagen: '/imagenes/agata.jpg',
      colorTag: 'agata'
    },
    {
      id: 'amatista',
      nombre: 'Amatista',
      significado: 'Protección y calma espiritual',
      descripcion: 'Variedad de cuarzo violeta. Se le atribuye la capacidad de calmar la mente, favorecer el descanso y proteger contra energías negativas. Tradicionalmente asociada a la intuición y la meditación.',
      imagen: 'imagenes/amatista.jpg',
      colorTag: 'malaquita'
    },
    {
      id: 'citrino',
      nombre: 'Citrino',
      significado: 'Abundancia y vitalidad',
      descripcion: 'Vinculado a la prosperidad, la energía positiva y la vitalidad. Popular como "piedra de la abundancia" en espacios de trabajo y comercios.',
      imagen: 'imagenes/citrino.jpg',
      colorTag: 'agata'
    },
    {
      id: 'cuarzo-blanco',
      nombre: 'Cuarzo Blanco',
      significado: 'Claridad y amplificación',
      descripcion: 'Considerado un "amplificador" de energía. Se le atribuye la capacidad de potenciar la claridad mental y limpiar energéticamente otras piedras cercanas.',
      imagen: 'imagenes/cuarzoblanco.jpg',
      colorTag: 'malaquita'
    },
    {
      id: 'cuarzo-rosa',
      nombre: 'Cuarzo Rosa',
      significado: 'Amor y armonía',
      descripcion: 'Uno de los más populares en joyería. Asociado al amor incondicional, la ternura y la paz en las relaciones. Se dice que abre el "centro emocional".',
      imagen: 'imagenes/cuarzorosa.jpg',
      colorTag: 'agata'
    },
    {
      id: 'rodocrosita',
      nombre: 'Rodocrosita',
      significado: 'Amor propio y sanación emocional',
      descripcion: 'Reconocible por sus bandas rosadas y blancas. Vinculada con el amor propio, la compasión y la sanación de heridas emocionales del pasado.',
      imagen: 'imagenes/rodocrosita.jpg',
      colorTag: 'malaquita'
    },
    {
      id: 'turmalina-negra',
      nombre: 'Turmalina Negra',
      significado: 'Protección y conexión a tierra',
      descripcion: 'Muy usada para protección energética. Se dice que absorbe energías negativas y ayuda a sentirse conectado a tierra, reduciendo la ansiedad.',
      imagen: 'imagenes/turmalinanegra.jpg',
      colorTag: 'agata'
    }
  ]);

  letraActiva = signal<string | null>(null);
  busqueda = signal<string>('');

  // Solo las letras que tienen al menos una piedra se muestran habilitadas
  letrasDisponibles = computed(() => {
    const letras = new Set(this.piedras().map(p => p.nombre.charAt(0).toUpperCase()));
    return letras;
  });

  abecedario = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  piedrasFiltradas = computed(() => {
    const letra = this.letraActiva();
    const texto = this.busqueda().trim().toLowerCase();

    return this.piedras()
      .filter(p => !letra || p.nombre.toUpperCase().startsWith(letra))
      .filter(p =>
        !texto ||
        p.nombre.toLowerCase().includes(texto) ||
        p.significado.toLowerCase().includes(texto)
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  seleccionarLetra(letra: string): void {
    this.letraActiva.set(this.letraActiva() === letra ? null : letra);
  }

  actualizarBusqueda(valor: string): void {
    this.busqueda.set(valor);
  }

  limpiarFiltros(): void {
    this.letraActiva.set(null);
    this.busqueda.set('');
  }
}
