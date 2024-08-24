import { Injectable } from '@angular/core';
import { Product } from '../models/product.model'; // Importar el modelo Product
import { Observable, BehaviorSubject, of } from 'rxjs'; // Importar Observable, BehaviorSubject y of
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orderList: Product[] = []; // Lista de pedidos
  private orderListSubject: BehaviorSubject<Product[]> = new BehaviorSubject(this.orderList);

  constructor(private http: HttpClient) {}
  public apiUrl = 'http://localhost:3000/api';
  //public apiUrl = 'http://192.168.1.41:3000/api';

  getProductById(table: string, id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/data/${table}/${id}`);
  }

  getProductsByTitle(table: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/data/${table}`);
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
    const existingProduct = this.orderList.find(p => p.Nombre === product.Nombre);
    if (existingProduct) {
        existingProduct.Cantidad = product.Cantidad;
    } else {
        this.orderList.push(product);
    }
    this.orderListSubject.next(this.orderList);
}

  removeProduct(product: Product): void {
    this.orderList = this.orderList.filter(p => p.Nombre !== product.Nombre);
    this.orderListSubject.next(this.orderList);
  }


  getOrderList(): Observable<Product[]> {
    return this.orderListSubject.asObservable();
  }
}
