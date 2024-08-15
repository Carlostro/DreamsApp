import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeladeriaPage } from './heladeria.page';

describe('HeladeriaPage', () => {
  let component: HeladeriaPage;
  let fixture: ComponentFixture<HeladeriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HeladeriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
