import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  FormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../auth.service';
import { TokenStorageService } from '../../core/services/token-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['../auth.css'],
})
export class LoginComponent {
  mensajeError: string = '';
  loginForm!: FormGroup;
  loading: boolean = false;
  mostrarPassword = false;

  step: 'LOGIN' | 'OTP' = 'LOGIN';
  tempToken: string | null = null;
  otpCode: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.loginForm.invalid) {
      this.mensajeError = 'Debe completar todos los campos';
      return;
    }

    this.loading = true;
    this.mensajeError = '';

    const loginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (resp) => {
        this.loading = false;

        // CASO 2FA
        if (resp.requires2FA) {
          this.tempToken = resp.tempToken!;
          this.step = 'OTP';
          return;
        }

        // LOGIN NORMAL
        this.authService.saveSession(resp);

        if (resp.role === 'ROLE_ADMIN') {
          this.router.navigate(['/libros']);
        } else {
          this.router.navigate(['/catalogo']);
        }
      },

      error: (err) => {
        console.error('Error login:', err);
        this.loading = false;
        this.mensajeError = 'Usuario o contraseña incorrectos';
      },
    });
  }

  // función OTP
  onVerifyOtp() {
    if (!this.otpCode) {
      this.mensajeError = 'Ingrese el código OTP';
      return;
    }

    if (!this.tempToken) {
      this.mensajeError = 'Sesión inválida, vuelva a iniciar login';
      return;
    }

    this.loading = true;
    this.mensajeError = '';

    this.authService.verify2fa(this.tempToken, this.otpCode).subscribe({
      next: (resp) => {
        this.loading = false;

        this.authService.saveSession(resp);

        // reset estado
        this.step = 'LOGIN';
        this.otpCode = '';
        this.tempToken = null;

        if (resp.role === 'ROLE_ADMIN') {
          this.router.navigate(['/libros']);
        } else {
          this.router.navigate(['/catalogo']);
        }
      },

      error: () => {
        this.loading = false;
        this.mensajeError = 'Código inválido';
      },
    });
  }

  cancelOtp() {
    this.step = 'LOGIN';
    this.otpCode = '';
    this.tempToken = null;
    this.mensajeError = '';
  }
}
