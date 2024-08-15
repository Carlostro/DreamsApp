import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaKioscoPage } from './listaKiosco.page';

describe('ListaKioscoPage', () => {
  let component: ListaKioscoPage;
  let fixture: ComponentFixture<ListaKioscoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaKioscoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
