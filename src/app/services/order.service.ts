import { Injectable } from '@angular/core';
import { Product } from '../models/product.model'; // Importar el modelo Product
import { Observable, BehaviorSubject, of } from 'rxjs'; // Importar Observable, BehaviorSubject y of
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orderList: Product[] = []; // Lista de pedidos
  private orderListSubject: BehaviorSubject<Product[]> = new BehaviorSubject(this.orderList);

  constructor(private http: HttpClient) {}
  public apiUrl = environment.apiUrl;

  getProductById(table: string, id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/data/${table}/${id}`);
  }

  getProductsByTitle(table: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/data/${table}`);
  }

  getPromotions(): Observable<Product[]> {
    console.log("getPromotions");
    const url = `${this.apiUrl}/promosheladeria/active`; // Actualizar la URL para obtener promociones activas
    return this.http.get<Product[]>(url);
  }

  getPromosPuntos(): Observable<Product[]> {
    console.log("getPromosPuntos");
    const url = `${this.apiUrl}/promospuntos/active`;
    return this.http.get<Product[]>(url);
  }

  addProduct(product: Product): void {
    const existingProduct = this.orderList.find(p =>
      p.Nombre === product.Nombre &&
      this.areComplementosEqual(p.Complementos || [], product.Complementos || [])
    );

    if (existingProduct) {
      existingProduct.Cantidad = (existingProduct.Cantidad || 0) + 1;
    } else {
      this.orderList.push({ ...product, Cantidad: 1 });
    }
    this.orderListSubject.next(this.orderList);
  }

  private areComplementosEqual(complementos1: any[], complementos2: any[]): boolean {
    if (complementos1.length !== complementos2.length) {
      return false;
    }
    for (let i = 0; i < complementos1.length; i++) {
      if (complementos1[i].Nombre !== complementos2[i].Nombre) {
        return false;
      }
    }
    return true;
  }
  updateProductQuantity(product: Product): void {
    const existingProduct = this.orderList.find(p => 
        p.Nombre === product.Nombre && JSON.stringify(p.Complementos) === JSON.stringify(product.Complementos)
    );

    if (existingProduct) {
        existingProduct.Cantidad = product.Cantidad;
    } else {
        this.orderList.push(product);
    }

    this.orderListSubject.next(this.orderList);
}

removeProduct(product: Product): void {
  this.orderList = this.orderList.filter(p => 
      !(p.Nombre === product.Nombre && JSON.stringify(p.Complementos) === JSON.stringify(product.Complementos))
  );

  this.orderListSubject.next(this.orderList);
}


  getOrderList(): Observable<Product[]> {
    return this.orderListSubject.asObservable();
  }

  clearOrder(): void {
    this.orderList = [];
    this.orderListSubject.next(this.orderList); // Notifica a los suscriptores que la lista ha sido vaciada
  }

  // Libera la mesa o sesión en el backend de forma robusta
  releaseTable(code: string): void {
    const sessionType = localStorage.getItem('sessionType');
    const sessionId = localStorage.getItem('sessionId');
    if (sessionType === 'cliente' && sessionId) {
      // Cerrar sesión de cliente registrado
      const url = `${this.apiUrl}/sesiones-clientes/close`;
      const blob = new Blob([JSON.stringify({ sessionId })], { type: 'application/json' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
          keepalive: true
        });
      }
    } else if (code) {
      // Mesa anónima: usar DELETE con keepalive
      const url = `${this.apiUrl}/active-tables/${code}`;
      fetch(url, {
        method: 'DELETE',
        keepalive: true
      });
    }
    // Limpiar localStorage
    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionType');
  }
}
