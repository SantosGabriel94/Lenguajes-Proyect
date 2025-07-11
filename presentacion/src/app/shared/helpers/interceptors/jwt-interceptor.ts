import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Token } from '../../services/token';
import { AuthService } from '../../services/auth-service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const servToken = inject(Token);
  const token = servToken.token;
  if (inject(AuthService).isLoggedIn()) {
    // solicitud y agrega el encabezado de la autorización
    const cloneReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloneReq);
  }
  
  return next(req);
};
