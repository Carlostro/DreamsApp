import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CodigoMesaGuard } from './guards/codigo-mesa.guard';

const routes: Routes = [

  {
    path: '',
    redirectTo: ':code/heladeria',
    pathMatch: 'full'
  },
  //Paginas principales enrutadas con el codigo de mesa
  {
  path: ':code/heladeria',
  loadChildren: () => import('./paginasPrincipales/heladeria/heladeria.module').then(m => m.HeladeriaPageModule),
  canActivate: [CodigoMesaGuard]
  },
  {
    path: ':code/kiosco',
    loadChildren: () => import('./paginasPrincipales/kiosco/kiosco.module').then(m => m.KioscoPageModule)
  },
  {
    path: ':code/rss',
    loadChildren: () => import('./paginasPrincipales/rss/rss.module').then(m => m.RssPageModule)
  },

   //Rutas para la Heladeria
  {
    path: ':code/product-heladeria',
    loadChildren: () => import('./cartasProductos/cartaHeladeria/product-heladeria.module').then(m => m.ProductHeladeriaPageModule)
  },
  {
    path: ':code/product-kiosco',
    loadChildren: () => import('./cartasProductos/cartaKiosco/product-kiosco.module').then(m => m.ProductKioscoPageModule)
  },
  {
    path: ':code/lista-pedido',
    loadChildren: () => import('./lista-pedido/lista-pedido.module').then(m => m.ListaPedidoPageModule)
  },
  {
    path: ':code/cervezas',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/refrescos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/vinos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/polos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/ginebras',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/cafe',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/bolleria',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/copas-helado',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/granizados',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/snacks',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':code/cubatas',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/batido-helado',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/zumos',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/smoothies',
    loadChildren: () => import('./productosHeladeria/listaHeladeria/listaHeladeria.module').then(m => m.ListaHeladeriaPageModule)
  },
  {
    path: ':code/frutos-secos',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':code/golosinas',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':code/caramelos',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':code/bebidas',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':code/juguetes',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':code/polos2',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':code/galletas',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  },
  {
    path: ':code/prensa',
    loadChildren: () => import('./productosKiosco/listaKiosco/listaKiosco.module').then(m => m.ListaKioscoPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
