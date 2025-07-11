import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, retry, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Token } from './token';
import { IToken } from '../models/interfaces';
import { User } from '../models/User';


const _SERVER = environment.servidor;
const LIMITE_REFRESH = 20; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private srvToken = inject(Token);
  private router = inject(Router);



  public userActualS = signal(new User);

  constructor() { }

  public login(datos: { idUsuario: '', passw: '' }): Observable<any> {
    return this.http
      .patch<IToken>(`${_SERVER}/api/auth`, datos)
      .pipe(
        retry(1),
        tap((tokens) => {
          this.doLogin(tokens);
          this.router.navigate(['/home']);
          console.log(tokens);
        }),
        map(() => true),
        catchError((error) => {
          return of(error.status)
        })
      )
  }

  public loggOut() {
    if (this.isLoggedIn()) {
      this.http
        .delete(`${_SERVER}/api/auth/cerrar/${this.userActual.idUsuario}`)
        .subscribe();
      this.doLoggOut();
    }
  }


  private doLogin(tokens: IToken) {
    // guardar Tokens
    this.srvToken.setTokens(tokens);
    // Actualizar los datos globales para usuario y rol
    
    this.userActualS.set(this.userActual);
  }

  private doLoggOut() {
    // eliminar los Tokens
    if (this.srvToken.token) {
      this.srvToken.eliminarTokens();
    }
    this.userActualS.set(this.userActual);
    // Redirigir a login e iniciar
    this.router.navigate(['/home']);

  }


  public isLoggedIn(): boolean {
    return !!this.srvToken.token && !this.srvToken.jwtTokenExp();
  }

  public get userActual(): User {
    if (!this.srvToken.token) {
      return new User();
    }
    const tokenD = this.srvToken.decodeToken();
    return new User({
      idUsuario: tokenD.sub,
      nombre: tokenD.nom,
      rol: Number(tokenD.rol) // Forzar a número
    });
  }

  public verificarRefresh(): boolean{
    if(this.isLoggedIn()){
      this.userActualS.set(this.userActual); // Actualizar el signal del usuario
      const tiempo= this.srvToken.tiempoExpToken();
      if(tiempo <= 0){
        this.loggOut();
        return false;
      }
      if(tiempo>0 && tiempo <= LIMITE_REFRESH){
        this.srvToken.refreshTokens();
       
      }
      return true;
    } else {
      this.loggOut();
      return false;
    }
  }

}
