import { Injectable, signal } from '@angular/core';
import { Piedra } from '../models/piedra.model';

@Injectable({ providedIn: 'root' })
export class PiedraService {

  piedras = signal<Piedra[]>([
    { id: 'cuazo-rosa-20', nombre: 'Cuarzo Rosa', variedad: 'Cuarzo', tipo: 'calibrada', calibreMm: 20, precio: 4500, imagen: 'catalogo-piedras/cuarzo-rosa.jpg', colorTag: 'agata' },
    { id: 'cuarzo-rutilado-18', nombre: 'Cuarzo Rutilado', variedad: 'Cuarzo', tipo: 'calibrada', calibreMm: 18, precio: 4200, imagen: 'catalogo-piedras/cuarzo-rutilado.jpg', colorTag: 'malaquita' },
    { id: 'haoliotis-01', nombre: 'Haliotis', variedad: 'Otras piedras', tipo: 'calibrada', precio: 2800, imagen: 'catalogo-piedras/Haliotis.jpg', colorTag: 'malaquita' },
    { id: 'labradorita-22', nombre: 'Labradorita', variedad: 'Labradorita', tipo: 'calibrada', calibreMm: 22, precio: 3800, imagen: 'catalogo-piedras/labradorita1.jpg', colorTag: 'agata' },
    { id: 'labradorita', nombre: 'Labradorita', variedad: 'Labradorita', tipo: 'calibrada', precio: 3100, imagen: 'catalogo-piedras/labradorita2.jpg', colorTag: 'malaquita' },
    { id: 'labradorita-23', nombre: 'Labradorita', variedad: 'Labradorita', tipo: 'calibrada', calibreMm: 22, precio: 3800, imagen: 'catalogo-piedras/labradorita3.jpg', colorTag: 'agata' },
    { id: 'labradorita-24', nombre: 'Labradorita', variedad: 'Labradorita', tipo: 'calibrada', calibreMm: 22, precio: 3800, imagen: 'catalogo-piedras/labradorita4.jpg', colorTag: 'malaquita' },
    { id: 'lapizlasuli-16', nombre: 'Lapizlasuli', variedad: 'Lapislazuli', tipo: 'calibrada', calibreMm: 16, precio: 5200, imagen: 'catalogo-piedras/lapizlasuli.jpg', colorTag: 'agata' },
    { id: 'luna-01', nombre: 'Piedra de la luna', variedad: 'Piedra de la luna', tipo: 'calibrada', calibreMm: 16, precio: 3900, imagen: 'catalogo-piedras/luna1.jpg', colorTag: 'malaquita' },
    { id: 'luna-24', nombre: 'Piedra de la luna', variedad: 'Piedra de la luna', tipo: 'calibrada', calibreMm: 24, precio: 4900, imagen: 'catalogo-piedras/luna2.jpg', colorTag: 'agata' },
    { id: 'obsidiana-plateada-7', nombre: 'Obsidiana Plateada', variedad: 'Obsidiana', tipo: 'calibrada', precio: 2500, imagen: 'catalogo-piedras/obsidiana-plateada.jpg', colorTag: 'malaquita' },
    { id: 'obsidiana-plateada-1', nombre: 'Obsidiana Plateada', variedad: 'Obsidiana', tipo: 'calibrada', precio: 2500, imagen: 'catalogo-piedras/obsidiana-plateada2.jpg', colorTag: 'malaquita' },
  ]);
}