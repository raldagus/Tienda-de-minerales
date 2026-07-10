import { TestBed } from '@angular/core/testing';
import { PedidoService } from './pedido.service';
import { Piedra } from '../models/piedra.model';

const piedraA: Piedra = {
  id: 'agata-azul-20',
  nombre: 'Ágata Azul',
  variedad: 'Ágata',
  calibreMm: 20,
  precio: 4500,
  imagen: 'imagenes/agata-azul.jpg',
  colorTag: 'agata',
};

const piedraB: Piedra = {
  id: 'agata-bruto-01',
  nombre: 'Ágata en Bruto',
  variedad: 'Ágata',
  tipo: 'bruto',
  precio: 2800,
  imagen: 'imagenes/agata-bruto.jpg',
  colorTag: 'malaquita',
};

describe('PedidoService', () => {
  let service: PedidoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidoService);
  });

  it('agrega una piedra nueva al pedido con cantidad 1', () => {
    service.agregarAlPedido(piedraA);
    expect(service.pedido()).toEqual([{ piedra: piedraA, cantidad: 1 }]);
  });

  it('incrementa la cantidad si la piedra ya está en el pedido', () => {
    service.agregarAlPedido(piedraA);
    service.agregarAlPedido(piedraA);
    expect(service.pedido()).toEqual([{ piedra: piedraA, cantidad: 2 }]);
  });

  it('quita una piedra del pedido por id', () => {
    service.agregarAlPedido(piedraA);
    service.agregarAlPedido(piedraB);
    service.quitarDelPedido(piedraA.id);
    expect(service.pedido()).toEqual([{ piedra: piedraB, cantidad: 1 }]);
  });

  it('calcula el total y la cantidad de items', () => {
    service.agregarAlPedido(piedraA);
    service.agregarAlPedido(piedraA);
    service.agregarAlPedido(piedraB);
    expect(service.totalPedido()).toBe(4500 * 2 + 2800);
    expect(service.cantidadItems()).toBe(3);
  });

  it('togglePanel alterna el estado de estaAbierto', () => {
    expect(service.estaAbierto()).toBe(false);
    service.togglePanel();
    expect(service.estaAbierto()).toBe(true);
    service.togglePanel();
    expect(service.estaAbierto()).toBe(false);
  });

  it('linkPedidoWhatsapp arma el mensaje con el detalle del pedido', () => {
    service.agregarAlPedido(piedraA);
    const link = service.linkPedidoWhatsapp();
    expect(link).toContain('https://wa.me/5493834778412?text=');
    expect(decodeURIComponent(link)).toContain('1x Ágata Azul (20mm) - $4500');
    expect(decodeURIComponent(link)).toContain('Total: $4500');
  });
});
