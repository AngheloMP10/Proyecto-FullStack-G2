import { Libro } from './libro';

export type EstadoPrestamo =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'EN_PRESTAMO'
  | 'FINALIZADO';

export interface Prestamo {
  id: number;
  fechaSolicitud: string;
  fechaDevolucion?: string;
  estado: EstadoPrestamo;
  libro: Libro;
  usuario: any;
}