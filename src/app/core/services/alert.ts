import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private toastId = 0;

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  // ===== MÉTODOS SWEETALERT2 (Compatibilidad) =====

  // Alerta de Éxito (Verde)
  success(title: string, message: string): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#0d6efd',
    });
  }

  // Alerta de Error (Rojo)
  error(title: string, message: string): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#dc3545',
    });
  }

  // Confirmación (Interrogación)
  // Promesa booleana: true si aceptó, false si canceló
  async confirmRequest(
    title: string,
    message: string,
    confirmText: string = 'Sí, confirmar'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
    });

    return result.isConfirmed;
  }

  // ===== MÉTODOS TOAST (Notificaciones ligeras) =====

  successToast(message: string, duration: number = 3000): void {
    this.showToast(message, 'success', duration);
  }

  errorToast(message: string, duration: number = 4000): void {
    this.showToast(message, 'error', duration);
  }

  infoToast(message: string, duration: number = 3000): void {
    this.showToast(message, 'info', duration);
  }

  warningToast(message: string, duration: number = 3500): void {
    this.showToast(message, 'warning', duration);
  }

  private showToast(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration: number
  ): void {
    const id = `toast-${++this.toastId}`;
    const toast: Toast = { id, message, type, duration };

    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, toast]);

    setTimeout(() => this.removeToast(id), duration);
  }

  private removeToast(id: string): void {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter((t) => t.id !== id));
  }

  clearAllToasts(): void {
    this.toasts$.next([]);
  }
}
