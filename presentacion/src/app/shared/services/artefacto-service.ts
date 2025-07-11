import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { TipoArtefacto } from '../models/interfaces';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class ArtefactoService {

  private readonly http = inject(HttpClient);
  constructor() { }

  filtrar(parametros: any) {
    let params = new HttpParams;
    for (const prop in parametros) {
      params = params.append(prop, parametros[prop]);
    }
    return this.http.get<any>(`${_SERVER}/api/artefacto/filtrar/0/100`, { params: params });
  }

  guardar(datos: TipoArtefacto, id?: number): Observable<TipoArtefacto> {
    delete datos.id;
    // console.log(datos);
    if (id) {
      return this.http.put<any>(`${_SERVER}/api/artefacto/${id}`, datos);
    }
    return this.http.post<any>(`${_SERVER}/api/artefacto`, datos);
  }

  eliminar(id: number) {
    return this.http.delete<any>(`${_SERVER}/api/artefacto/${id}`)
      .pipe(
        retry(1),
        map(() => true),
        catchError(this.handleError)
      );
  }

  buscar(id: number) {
    return this.http.get<TipoArtefacto>(`${_SERVER}/api/artefacto/${id}`);
  }

  buscarPorCliente(idCliente: number) {
    return this.http.get<TipoArtefacto[]>(`${_SERVER}/api/artefacto/cliente/${idCliente}`);
  }

  buscarPorSerie(serie: string) {
    return this.http.get<TipoArtefacto>(`${_SERVER}/api/artefacto/serie/${serie}`);
  }

  private handleError(error: any) {
    return throwError(() => {
      console.error('Error en ArtefactoService:', error);
      return error;
    });
  }
}
