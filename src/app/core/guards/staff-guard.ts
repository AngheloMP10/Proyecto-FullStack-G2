import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const staffGuard: CanActivateFn = () => {
  const router = inject(Router);

  const role = localStorage.getItem('role');

  if (role === 'ROLE_ADMIN' || role === 'ROLE_BIBLIOTECARIO') {
    // Admin o Bibliotecario
    return true;
  } else {
    // Usuario normal
    router.navigate(['/catalogo']);
    return false;
  }
};
