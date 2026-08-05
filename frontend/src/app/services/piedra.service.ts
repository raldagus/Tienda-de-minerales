import { Injectable, signal } from '@angular/core';
import { Piedra } from '../models/piedra.model';

@Injectable({ providedIn: 'root' })
export class PiedraService {

  piedras = signal<Piedra[]>([
    { id: 'cuazo-rosa-20', nombre: 'Cuarzo', descripcion: 'Cuarzo Rosa', categoriaNombre: 'calibrada', calibreMm: 20, precio: 4500, imagen: 'catalogo-piedras/cuarzo-rosa.jpg' },
    { id: 'cuarzo-rutilado-18', nombre: 'Cuarzo', descripcion: 'Cuarzo Rutilado', categoriaNombre: 'calibrada', calibreMm: 18, precio: 4200, imagen: 'catalogo-piedras/cuarzo-rutilado.jpg' },
    { id: 'haoliotis-01', nombre: 'Otras piedras', descripcion: 'Haliotis', categoriaNombre: 'calibrada', precio: 2800, imagen: 'catalogo-piedras/Haliotis.jpg' },
    { id: 'labradorita-22', nombre: 'Labradorita', descripcion: 'Labradorita', categoriaNombre: 'calibrada', calibreMm: 22, precio: 3800, imagen: 'catalogo-piedras/labradorita1.jpg' },
    { id: 'labradorita', nombre: 'Labradorita', descripcion: 'Labradorita', categoriaNombre: 'calibrada', precio: 3100, imagen: 'catalogo-piedras/labradorita2.jpg' },
    { id: 'labradorita-23', nombre: 'Labradorita', descripcion: 'Labradorita', categoriaNombre: 'calibrada', calibreMm: 22, precio: 3800, imagen: 'catalogo-piedras/labradorita3.jpg' },
    { id: 'labradorita-24', nombre: 'Labradorita', descripcion: 'Labradorita', categoriaNombre: 'calibrada', calibreMm: 22, precio: 3800, imagen: 'catalogo-piedras/labradorita4.jpg' },
    { id: 'lapizlasuli-16', nombre: 'Lapislazuli', descripcion: 'Lapizlasuli', categoriaNombre: 'calibrada', calibreMm: 16, precio: 5200, imagen: 'catalogo-piedras/lapizlasuli.jpg' },
    { id: 'luna-01', nombre: 'Piedra de la luna', descripcion: 'Piedra de la luna', categoriaNombre: 'calibrada', calibreMm: 16, precio: 3900, imagen: 'catalogo-piedras/luna1.jpg' },
    { id: 'luna-24', nombre: 'Piedra de la luna', descripcion: 'Piedra de la luna', categoriaNombre: 'calibrada', calibreMm: 24, precio: 4900, imagen: 'catalogo-piedras/luna2.jpg' },
    { id: 'obsidiana-plateada-7', nombre: 'Obsidiana', descripcion: 'Obsidiana Plateada', categoriaNombre: 'calibrada', precio: 2500, imagen: 'catalogo-piedras/obsidiana-plateada.jpg' },
    { id: 'obsidiana-plateada-1', nombre: 'Obsidiana', descripcion: 'Obsidiana Plateada', categoriaNombre: 'calibrada', precio: 2500, imagen: 'catalogo-piedras/obsidiana-plateada2.jpg' },
  ]);
}
