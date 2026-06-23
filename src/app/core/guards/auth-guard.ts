import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

export const authGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  const token = tokenStorage.getToken();

  // No hay token
  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  try {
    // Decodificar payload JWT
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Bloquear token temporal de 2FA
    if (payload.type === '2FA_TEMP') {
      router.navigate(['/auth/login']);
      return false;
    }

    // Token válido
    return true;
  } catch (error) {
    // Token corrupto o inválido
    console.error('Token inválido:', error);
    router.navigate(['/auth/login']);
    return false;
  }
};
