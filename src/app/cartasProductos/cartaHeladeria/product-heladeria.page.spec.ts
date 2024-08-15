import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductHeladeriaPage } from './product-heladeria.page';

describe('ProductHeladeriaPage', () => {
  let component: ProductHeladeriaPage;
  let fixture: ComponentFixture<ProductHeladeriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductHeladeriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
