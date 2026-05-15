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
  Activo: number;
  ComplementoActivo: number;
  PuntosNecesarios?: number; // Para promos de puntos
  PrecioOriginal?: number; // Precio original antes del canje
  EsCanjeoPuntos?: boolean; // Marca si es un canje por puntos
}
