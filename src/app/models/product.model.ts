// src/app/models/product.model.ts

export interface Product {
  Id: number;
  Nombre: string;
  Precio: number;
  Cantidad: number;
  Imagen: string;
  Descripcion: string;
  Ncomplementos: number;
  Complementos?: any[];
  PrecioTotal: number;
}
