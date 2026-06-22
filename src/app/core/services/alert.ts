import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  // SWEETALERT2 (Modales estáticos)

  success(title: string, message: string): void {
    Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#0d6efd',
    });
  }

  error(title: string, message: string): void {
    Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#dc3545',
    });
  }

  async confirmRequest(
    title: string,
    message: string,
    confirmText: string = 'Sí, confirmar',
  ): Promise<boolean> {
    const result = await Swal.fire({
      title,
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

  // CONFIGURACIÓN DE TOASTS (SweetAlert2)

  private Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  // TOAST LIGEROS (Para WebSockets)

  successToast(message: string, duration: number = 4500): void {
    this.Toast.fire({ icon: 'success', title: message, timer: duration });
  }

  errorToast(message: string, duration: number = 5000): void {
    this.Toast.fire({ icon: 'error', title: message, timer: duration });
  }

  infoToast(message: string, duration: number = 4000): void {
    this.Toast.fire({ icon: 'info', title: message, timer: duration });
  }

  warningToast(message: string, duration: number = 5500): void {
    this.Toast.fire({ icon: 'warning', title: message, timer: duration });
  }
}
