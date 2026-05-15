import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromoPuntosPage } from './promo-puntos.page';

describe('PromoPuntosPage', () => {
  let component: PromoPuntosPage;
  let fixture: ComponentFixture<PromoPuntosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PromoPuntosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
