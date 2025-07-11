import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { TipoTecnico } from '../models/interfaces';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class TecnicoService {

  private readonly http = inject(HttpClient);

  constructor() { }

  filtrar(parametros: any) {
      let params = new HttpParams;
      for (const prop in parametros) {
        params = params.append(prop, parametros[prop]);
      }
      return this.http.get<any>(`${_SERVER}/api/tecnico/filtrar/0/100`, { params: params });
    }
  
    guardar(datos: TipoTecnico, id?: number): Observable<TipoTecnico> {
      delete datos.id;
      // console.log(datos);
      if (id) {
        return this.http.put<any>(`${_SERVER}/api/tecnico/${id}`, datos);
      }
      return this.http.post<any>(`${_SERVER}/api/tecnico`, datos);
    }
  
    eliminar(id: number) {
      return this.http.delete<any>(`${_SERVER}/api/tecnico/${id}`)
        .pipe(
          retry(1),
          map(() => true),
          catchError(this.handleError)
        );
    }
  
    buscar(id: number) {
      return this.http.get<TipoTecnico>(`${_SERVER}/api/tecnico/${id}`);
    }
  
    private handleError(error: any) {
      return throwError(() => {
        return error.status
      }
      )
    }
}
