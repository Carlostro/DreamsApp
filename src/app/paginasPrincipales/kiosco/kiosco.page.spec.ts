import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KioscoPage } from './kiosco.page';

describe('KioscoPage', () => {
  let component: KioscoPage;
  let fixture: ComponentFixture<KioscoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KioscoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
