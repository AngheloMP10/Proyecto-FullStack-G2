import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  constructor() {}

  // Guarda token
  saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  // Obtiene token
  getToken(): string | null {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  // Elimina token
  signOut(): void {
    window.localStorage.removeItem(TOKEN_KEY);
  }

  // Verifica si estás logeado
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // Obtiene el tipo de token desde el JWT
  getTokenType(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.type || null;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }
}
