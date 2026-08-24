import { Component, signal, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Variedad, Tipo } from '../../models/producto.model';
import { PedidoService } from '../../services/pedido.service'
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent implements OnInit {
  protected pedidoService = inject(PedidoService);
  protected productoService = inject(ProductoService);
  private platformId = inject(PLATFORM_ID);

  piedras = this.productoService.piedras;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.productoService.cargar();
    }
  }

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

  precioMinCatalogo = computed(() => {
  const precios = this.piedras().map((p) => p.precioUnitario);
  return precios.length ? Math.min(...precios) : 0;
});

precioMaxCatalogo = computed(() => {
  const precios = this.piedras().map((p) => p.precioUnitario);
  return precios.length ? Math.max(...precios) : 0;
});

  piedrasFiltradas = computed(() => {
    const variedades = this.variedadesSeleccionadas();
    const tipos = this.tiposSeleccionados();
    const min = this.precioMin();
    const max = this.precioMax();

    return this.piedras().filter((p) => {
      const pasaVariedad = variedades.size === 0 || (p.variedad !== undefined && variedades.has(p.variedad));
      const pasaTipo = tipos.size === 0 || (p.tipo !== undefined && tipos.has(p.tipo));
      const pasaMin = min === null || p.precioUnitario >= min;
      const pasaMax = max === null || p.precioUnitario <= max;
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
