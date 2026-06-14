// Modelo de datos para Tardeo
export interface TardeoProduct {
  Id: string;
  Nombre: string;
  Descripcion: string;
  Imagen: string;
  Precio: number;
  Habilitado: boolean;
  FechaInicio: string | null;
  HoraInicio: string | null;
  FechaFin: string | null;
  HoraFin: string | null;
}
