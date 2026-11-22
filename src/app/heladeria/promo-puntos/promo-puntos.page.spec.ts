import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ClientesService } from '../../services/clientes.service';
import { InactivityService } from '../../services/inactivity.service';
import { OrderService } from '../../services/order.service';
import { PromoPuntosPageModule } from './promo-puntos.module';
import { PromoPuntosPage } from './promo-puntos.page';

describe('PromoPuntosPage', () => {
  let component: PromoPuntosPage;
  let fixture: ComponentFixture<PromoPuntosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoPuntosPageModule],
      providers: [
        {
          provide: OrderService,
          useValue: {
            apiUrl: '',
            getPromosPuntos: () => of([]),
            getOrderList: () => of([])
          }
        },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({})) }
        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ClientesService, useValue: { obtenerPuntosCliente: () => of({ success: false }) } },
        {
          provide: InactivityService,
          useValue: { startWatching: jasmine.createSpy(), stopWatching: jasmine.createSpy() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PromoPuntosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
