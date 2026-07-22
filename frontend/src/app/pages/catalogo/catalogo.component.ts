import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Piedra, Variedad, Tipo } from '../../models/piedra.model';
import { PedidoService } from '../../services/pedido.service'
import { PiedraService } from '../../services/piedra.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent {
  protected pedidoService = inject(PedidoService);
  private piedraService = inject(PiedraService);
  
  piedras = this.piedraService.piedras;

  readonly variedades: Variedad[] = ['Cuarzo', 'Turmalina', 'Ágata', 'Labradorita', 'Lapislazuli', 'Piedra de la luna', 'Obsidiana', 'Opalo', 'Otras piedras'];
  readonly tipos: { valor: Tipo; etiqueta: string }[] = [
    { valor: 'calibrada', etiqueta: 'Calibradas' },
    { valor: 'bruto', etiqueta: 'En bruto' },
  ];

  // Estado de filtros 
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
