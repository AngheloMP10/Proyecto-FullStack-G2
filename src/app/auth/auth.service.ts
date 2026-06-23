import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../core/services/token-storage.service';
import { AuthResponse, AuthRequest } from '../core/models/auth.interface';
import { environment } from '../../environments/environment';
import { QrResponse } from '../core/models/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // puerto (8080) URL desde environment
  private API_URL = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
  ) {}

  // Login
  login(usuario: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, usuario);
  }

  // Register
  register(usuario: AuthRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, usuario, {
      responseType: 'text',
    });
  }

  // Guarda token y datos de usuario
  saveSession(response: AuthResponse): void {
    if (response.token) {
      this.tokenStorage.saveToken(response.token);

      localStorage.setItem('username', response.username ?? '');
      localStorage.setItem('role', response.role ?? '');
    }
  }

  //OTP verify
  verify2fa(tempToken: string, code: string) {
    return this.http.post<AuthResponse>(`${this.API_URL}/verify-2fa`, {
      tempToken,
      code,
    });
  }

  // QR generation
  generateQr() {
    return this.http.get<QrResponse>(`${this.API_URL}/generate-qr`);
  }

  // Confirm 2FA
  confirm2fa(code: string) {
    return this.http.post(
      `${this.API_URL}/confirm-2fa`,
      { code },
      { responseType: 'text' },
    );
  }

  // Obtener usuario actual (estado 2FA, perfil, etc.)
  getCurrentUser(): Observable<{ is2faEnabled: boolean }> {
    return this.http.get<{ is2faEnabled: boolean }>(`${this.API_URL}/me`);
  }

  // Desactivar 2FA
  disable2fa() {
    return this.http.post(
      `${this.API_URL}/disable-2fa`,
      {},
      { responseType: 'text' },
    );
  }

  // Cerrar sesión
  logout(): void {
    this.tokenStorage.signOut();
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }

  // Verifica rol
  isAdmin(): boolean {
    return localStorage.getItem('role') === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    return localStorage.getItem('role') === 'ROLE_USER';
  }
}
