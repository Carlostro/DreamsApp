import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductKioscoPage } from './product-kiosco.page';

describe('ProductKioscoPage', () => {
  let component: ProductKioscoPage;
  let fixture: ComponentFixture<ProductKioscoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductKioscoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
