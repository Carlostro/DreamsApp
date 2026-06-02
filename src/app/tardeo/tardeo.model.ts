// Modelo de datos para Tardeo
export interface TardeoProduct {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  habilitado: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  hora_inicio?: string;
  hora_fin?: string;
}
