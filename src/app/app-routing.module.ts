import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CodigoMesaGuard } from './guards/codigo-mesa.guard';
import { LoginUsersComponent } from './login-users/login-users.component';
import { RegistroComponent } from './registro/registro.component';
import { PedidoEnviadoComponent } from './heladeria/pedido-enviado/pedido-enviado.component';
import { PaginaLoadingComponent } from './pagina-loading/pagina-loading.component';
import { PaginaSeleccionComponent } from './pagina-seleccion/pagina-seleccion.component';

const routes: Routes = [
  { path: ':code/loading', component: PaginaLoadingComponent },
  { path: ':code/login-users', component: LoginUsersComponent },
  { path: ':code/registro', component: RegistroComponent },
  { path: ':code/pedido-enviado', component: PedidoEnviadoComponent },
  { path: '', redirectTo: 'loading', pathMatch: 'full' },
   { path: ':timestamp/:code/pagina-seleccion', component: PaginaSeleccionComponent},

  {
    path: ':timestamp/:code/product-detail/:table/:id',
    loadChildren: () => import('./heladeria/product-detail/product-detail.module').then(m => m.ProductDetailPageModule)
  },

  // Paginas principales enrutadas con el codigo de mesa
  {
    path: ':timestamp/:code/heladeria',
    loadChildren: () => import('./heladeria/paginaPrincipal/heladeria.module').then(m => m.HeladeriaPageModule),
    canActivate: [CodigoMesaGuard]
  },
  {
    path: ':timestamp/:code/kiosco',
    loadChildren: () => import('./kiosco/paginaPrincipal/kiosco.module').then(m => m.KioscoPageModule),
    canActivate: [CodigoMesaGuard]
  },
  {
    path: ':timestamp/:code/rss',
    loadChildren: () => import('./rss/rss.module').then(m => m.RssPageModule)
  },

  // Rutas para la Heladeria
  {
    path: ':timestamp/:code/product-heladeria',
    loadChildren: () => import('./heladeria/cartaHeladeria/product-heladeria.module').then(m => m.ProductHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/lista-pedido',
    loadChildren: () => import('./heladeria/lista-pedido/lista-pedido.module').then(m => m.ListaPedidoPageModule)
  },
  {
    path: ':timestamp/:code/vapers',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/cervezas',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/refrescos',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/vinos',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/polos',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/ginebras',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/cafe',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/bolleria',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/copas-helado',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/helados',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/granizados',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/chocolates',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/frappelatte',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/tostadas',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/smoothies',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/infusiones',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/batido-helado',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/zumos',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/chupitos',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/copas',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/cubatas',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/cocteles',
    loadChildren: () => import('./heladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/promos-heladeria',
    loadChildren: () => import('./heladeria/promos-heladeria/promos-heladeria.module').then(m => m.PromosHeladeriaPageModule)
  },

  // Rutas para el Kiosco
  // {
  //   path: ':timestamp/:code/lista-pedido-kiosco',
  //   loadChildren: () => import('./kiosco/lista-pedido-kiosco/lista-pedido-kiosco.module').then(m => m.ListaPedidoKioscoPageModule)
  // },
  {
    path: ':timestamp/:code/product-kiosco',
    loadChildren: () => import('./kiosco/cartaKiosco/product-kiosco.module').then(m => m.ProductKioscoPageModule)
  },
  {
    path: ':timestamp/:code/snacks',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/chuches',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/revistas',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/prensa',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/recargas',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/meriendas',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/cromos',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/caramelos',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/juguetes',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/impresion3d',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/bebidas',
    loadChildren: () => import('./kiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/promo-puntos',
    loadChildren: () => import('./heladeria/promo-puntos/promo-puntos.module').then( m => m.PromoPuntosPageModule)
  },
  {
    path: ':timestamp/:code/mis-pedidos',
    loadChildren: () => import('./heladeria/mis-pedidos/mis-pedidos.module').then( m => m.MisPedidosPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
