import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';

export const loginGuard: CanActivateFn = (route, state) => {
  const svrAuth = inject(AuthService);
  const router = inject(Router);

  return !svrAuth.isLoggedIn();
};
