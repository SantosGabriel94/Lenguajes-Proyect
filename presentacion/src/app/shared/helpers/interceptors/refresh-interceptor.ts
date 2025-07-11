import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { finalize } from 'rxjs';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const svrAuth = inject(AuthService);
  return next(req)
    .pipe(
      finalize(() => {
        if( svrAuth.isLoggedIn()){
          svrAuth.verificarRefresh();
        }
      })
    );
};
