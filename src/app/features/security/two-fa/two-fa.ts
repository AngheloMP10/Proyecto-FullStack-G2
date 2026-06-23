import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { AuthService } from '../../../auth/auth.service';
import { AlertService } from '../../../core/services/alert';
import { QrResponse } from '../../../core/models/auth.interface';

@Component({
  selector: 'app-two-fa',
  standalone: true,
  imports: [FormsModule, CommonModule, QRCodeComponent], // 2. AGREGAR AL ARRAY
  templateUrl: './two-fa.html',
  styleUrl: './two-fa.css',
})
export class TwoFaComponent implements OnInit {
  qrUrl: string = '';
  code: string = '';
  isLoading: boolean = false;
  is2faActive: boolean = false;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.verificarEstado2FA();
  }

  verificarEstado2FA(): void {
    this.isLoading = true;
    this.authService.getCurrentUser().subscribe({
      next: (res) => {
        this.is2faActive = res.is2faEnabled;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener estado 2FA:', err);
        this.isLoading = false;
      },
    });
  }

  generateQr(): void {
    this.isLoading = true;

    this.authService.generateQr().subscribe({
      next: (res: QrResponse) => {
        this.qrUrl = res.qrUrl;
        this.code = '';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al generar QR:', err);
        this.alertService.errorToast('Error al generar el código QR');
        this.isLoading = false;
      },
    });
  }

  confirm(): void {
    if (!this.code.trim()) {
      this.alertService.warningToast('Ingresa el código del Authenticator');
      return;
    }

    this.isLoading = true;

    this.authService.confirm2fa(this.code).subscribe({
      next: () => {
        this.alertService.successToast('✅ 2FA activado correctamente');
        this.qrUrl = '';
        this.code = '';
        this.is2faActive = true; // CAMBIAR ESTADO VISUAL
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al confirmar 2FA:', err);
        this.alertService.errorToast('Código incorrecto. Intenta de nuevo');
        this.isLoading = false;
      },
    });
  }

  // MÉTODO PARA DESACTIVAR
  async disable2FA() {
    const confirmado = await this.alertService.confirmRequest(
      'Desactivar Seguridad 2FA',
      '¿Está seguro de desactivar la autenticación en dos pasos? Tu cuenta será menos segura.',
      'Sí, desactivar',
    );

    if (confirmado) {
      this.isLoading = true;
      this.authService.disable2fa().subscribe({
        next: () => {
          this.alertService.successToast('2FA desactivado correctamente');
          this.is2faActive = false; // CAMBIAR ESTADO VISUAL
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al desactivar 2FA:', err);
          this.alertService.errorToast('No se pudo desactivar el 2FA');
          this.isLoading = false;
        },
      });
    }
  }
}
