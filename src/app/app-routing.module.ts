import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CodigoMesaGuard } from './guards/codigo-mesa.guard';
import { LoginComponent } from './login/login.component';
import { PaginaAdminComponent } from './pagina-admin/pagina-admin.component';
import { PedidoEnviadoComponent } from './pedido-enviado/pedido-enviado.component';
import { PaginaLoadingComponent } from './pagina-loading/pagina-loading.component';

const routes: Routes = [
  { path: ':code/loading', component: PaginaLoadingComponent },
  { path: ':code/pedido-enviado', component: PedidoEnviadoComponent },
  { path: '', redirectTo: 'loading', pathMatch: 'full' },

  {
    path: 'administrador', // Ruta para la página de login
    component: LoginComponent
  },
  {
    path: 'admin', // Ruta para la página de administración
    component: PaginaAdminComponent
  },

  {
    path: ':timestamp/:code/product-detail/:table/:id',
    loadChildren: () => import('./product-detail/product-detail.module').then(m => m.ProductDetailPageModule)
  },

  // Paginas principales enrutadas con el codigo de mesa
  {
    path: ':timestamp/:code/heladeria',
    loadChildren: () => import('./paginasPrincipales/heladeria/heladeria.module').then(m => m.HeladeriaPageModule),
    canActivate: [CodigoMesaGuard]
  },
  {
    path: ':timestamp/:code/kiosco',
    loadChildren: () => import('./paginasPrincipales/kiosco/kiosco.module').then(m => m.KioscoPageModule),

  },
  {
    path: ':timestamp/:code/rss',
    loadChildren: () => import('./paginasPrincipales/rss/rss.module').then(m => m.RssPageModule)
  },

  // Rutas para la Heladeria
  {
    path: ':timestamp/:code/product-heladeria',
    loadChildren: () => import('./cartasProductos/cartaHeladeria/product-heladeria.module').then(m => m.ProductHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/lista-pedido',
    loadChildren: () => import('./lista-pedido/lista-pedido.module').then(m => m.ListaPedidoPageModule)
  },
  {
    path: ':timestamp/:code/cervezas',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/refrescos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/vinos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/polos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/ginebras',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/cafe',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/bolleria',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/copas-helado',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/helados',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/granizados',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/chocolates',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/frappelatte',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/smoothies',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/infusiones',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/batido-helado',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/zumos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/chupitos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/copas',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/cubatas',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/cocteles',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':timestamp/:code/promos-heladeria',
    loadChildren: () => import('./promos-heladeria/promos-heladeria.module').then(m => m.PromosHeladeriaPageModule)
  },

  // Rutas para el Kiosco
  {
    path: ':timestamp/:code/product-kiosco',
    loadChildren: () => import('./cartasProductos/cartaKiosco/product-kiosco.module').then(m => m.ProductKioscoPageModule)
  },
  {
    path: ':timestamp/:code/snacks',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/frutos-secos',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/golosinas',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/caramelos',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/bebidas',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/juguetes',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/polos2',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/galletas',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':timestamp/:code/prensa',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
