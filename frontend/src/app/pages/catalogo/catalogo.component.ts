import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Piedra, Variedad, Tipo } from '../../models/piedra.model';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent {
  protected pedidoService = inject(PedidoService);

  piedras = signal<Piedra[]>([
    { id: 'agata-azul-20', nombre: 'Ágata Azul', variedad: 'Ágata', tipo: 'calibrada', calibreMm: 20, precio: 4500, imagen: 'imagenes/agata-azul.jpg', colorTag: 'agata' },
    { id: 'agata-verde-18', nombre: 'Ágata Verde', variedad: 'Ágata', tipo: 'calibrada', calibreMm: 18, precio: 4200, imagen: 'imagenes/agata-verde.jpg', colorTag: 'malaquita' },
    { id: 'agata-bruto-01', nombre: 'Ágata en Bruto', variedad: 'Ágata', tipo: 'bruto', precio: 2800, imagen: 'imagenes/agata-bruto.jpg', colorTag: 'malaquita' },
    { id: 'cuarzo-blanco-22', nombre: 'Cuarzo Blanco', variedad: 'Cuarzo', tipo: 'calibrada', calibreMm: 22, precio: 3800, imagen: 'imagenes/cuarzo-blanco.jpg', colorTag: 'agata' },
    { id: 'cuarzo-rosa-bruto', nombre: 'Cuarzo Rosa en Bruto', variedad: 'Cuarzo', tipo: 'bruto', precio: 3100, imagen: 'imagenes/cuarzo-rosa-bruto.jpg', colorTag: 'malaquita' },
    { id: 'turmalina-negra-16', nombre: 'Turmalina Negra', variedad: 'Turmalina', tipo: 'calibrada', calibreMm: 16, precio: 5200, imagen: 'imagenes/turmalina-negra.jpg', colorTag: 'agata' },
    { id: 'turmalina-bruto-01', nombre: 'Turmalina en Bruto', variedad: 'Turmalina', tipo: 'bruto', precio: 3900, imagen: 'imagenes/turmalina-bruto.jpg', colorTag: 'malaquita' },
    { id: 'amatista-24', nombre: 'Amatista', variedad: 'Otras piedras', tipo: 'calibrada', calibreMm: 24, precio: 4900, imagen: 'imagenes/amatista.jpg', colorTag: 'agata' },
    { id: 'citrino-bruto', nombre: 'Citrino en Bruto', variedad: 'Otras piedras', tipo: 'bruto', precio: 2500, imagen: 'imagenes/citrino-bruto.jpg', colorTag: 'malaquita' },
    { id: 'agata-fucsia-19', nombre: 'Ágata Fucsia', variedad: 'Ágata', tipo: 'calibrada', calibreMm: 19, precio: 4700, imagen: 'imagenes/agata-fucsia.jpg', colorTag: 'malaquita' },
  ]);

  readonly variedades: Variedad[] = ['Cuarzo', 'Turmalina', 'Ágata', 'Otras piedras'];
  readonly tipos: { valor: Tipo; etiqueta: string }[] = [
    { valor: 'calibrada', etiqueta: 'Calibradas' },
    { valor: 'bruto', etiqueta: 'En bruto' },
  ];

  // --- Estado de filtros ---
  variedadesSeleccionadas = signal<Set<Variedad>>(new Set());
  tiposSeleccionados = signal<Set<Tipo>>(new Set());

  precioMin = signal<number | null>(null);
  precioMax = signal<number | null>(null);

  precioMinCatalogo = computed(() => Math.min(...this.piedras().map((p) => p.precio)));
  precioMaxCatalogo = computed(() => Math.max(...this.piedras().map((p) => p.precio)));

  piedrasFiltradas = computed(() => {
    const variedades = this.variedadesSeleccionadas();
    const tipos = this.tiposSeleccionados();
    const min = this.precioMin();
    const max = this.precioMax();

    return this.piedras().filter((p) => {
      const pasaVariedad = variedades.size === 0 || variedades.has(p.variedad);
      const pasaTipo = tipos.size === 0 || (p.tipo !== undefined && tipos.has(p.tipo));
      const pasaMin = min === null || p.precio >= min;
      const pasaMax = max === null || p.precio <= max;
      return pasaVariedad && pasaTipo && pasaMin && pasaMax;
    });
  });

  hayFiltrosActivos = computed(
    () =>
      this.variedadesSeleccionadas().size > 0 ||
      this.tiposSeleccionados().size > 0 ||
      this.precioMin() !== null ||
      this.precioMax() !== null
  );

  toggleVariedad(variedad: Variedad): void {
    const set = new Set(this.variedadesSeleccionadas());
    set.has(variedad) ? set.delete(variedad) : set.add(variedad);
    this.variedadesSeleccionadas.set(set);
  }

  toggleTipo(tipo: Tipo): void {
    const set = new Set(this.tiposSeleccionados());
    set.has(tipo) ? set.delete(tipo) : set.add(tipo);
    this.tiposSeleccionados.set(set);
  }

  actualizarPrecioMin(valor: string): void {
    this.precioMin.set(valor === '' ? null : Number(valor));
  }

  actualizarPrecioMax(valor: string): void {
    this.precioMax.set(valor === '' ? null : Number(valor));
  }

  limpiarFiltros(): void {
    this.variedadesSeleccionadas.set(new Set());
    this.tiposSeleccionados.set(new Set());
    this.precioMin.set(null);
    this.precioMax.set(null);
  }
}
