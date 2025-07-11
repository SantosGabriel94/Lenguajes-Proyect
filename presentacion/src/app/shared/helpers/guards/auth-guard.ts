import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const svrAuth = inject(AuthService);
  const router = inject(Router);

  if (svrAuth.isLoggedIn()) {

    if (Object.keys(route.data).length !== 0 && route.data['roles'].indexOf(
      svrAuth.userActualS().rol) === -1) {
      return false;
    }
    return true;
  }
  svrAuth.loggOut();
  router.navigate(['/login']);
  return false;
};
