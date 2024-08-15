import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaHeladeriaPage } from './listaHeladeria.page';

describe('ListaHeladeriaPage', () => {
  let component: ListaHeladeriaPage;
  let fixture: ComponentFixture<ListaHeladeriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaHeladeriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
