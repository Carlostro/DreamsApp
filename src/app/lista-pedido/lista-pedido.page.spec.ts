import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaPedidoPage } from './lista-pedido.page';

describe('ListaPedidoPage', () => {
  let component: ListaPedidoPage;
  let fixture: ComponentFixture<ListaPedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
