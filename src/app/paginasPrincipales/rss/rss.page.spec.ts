import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RssPage } from './rss.page';

describe('RssPage', () => {
  let component: RssPage;
  let fixture: ComponentFixture<RssPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RssPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
