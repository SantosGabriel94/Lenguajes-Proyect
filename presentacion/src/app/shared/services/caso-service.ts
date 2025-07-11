import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TipoCaso, TipoHistorial } from '../models/interfaces';
import { AuthService } from './auth-service';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class CasoService {

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  
  constructor() { }

  filtrar(parametros: any) {
    let params = new HttpParams();
    for (const prop in parametros) {
      params = params.append(prop, parametros[prop]);
    }
    return this.http.get<TipoCaso[]>(`${_SERVER}/api/caso/filtrar/0/100`, { params: params });
  }



  filtrarPorRol(parametros: any): Observable<TipoCaso[]> {
    const usuario = this.authService.userActual;
    
    switch (usuario.rol) {
      case 1: // Admin
      case 2: // Oficinista
        // Admins y oficinistas ven todos los casos
        return this.filtrar(parametros);
        
      case 3: // Técnico
        // Técnicos solo pueden ven casos asignados a ellos con filtros aplicados
         return this.buscarPorTecnico(usuario.idUsuario, parametros);
        
      case 4: // Cliente
        // los clientes solo ven casos
        return this.buscarPorCliente(usuario.idUsuario, parametros);
        
      default:
        // Usuario sin rol válido, no pueder ver casos
        return throwError(() => new Error('Usuario sin permisos para ver casos'));
    }
  }

  guardar(datos: TipoCaso, id?: number): Observable<TipoCaso> {
    const datosCopia = { ...datos };
    delete datosCopia.id;
    if (id) {
      return this.http.put<any>(`${_SERVER}/api/caso/${id}`, datosCopia);
    }
    return this.http.post<any>(`${_SERVER}/api/caso`, datosCopia);
  }

  eliminar(id: number) {
    return this.http.delete<any>(`${_SERVER}/api/caso/${id}`)
      .pipe(
        retry(1),
        map(() => true),
        catchError(this.handleError)
      );
  }

  buscar(id: number) {
    return this.http.get<TipoCaso>(`${_SERVER}/api/caso/${id}`);
  }

  buscarPorCliente(idCliente: string, parametros?: any) {
  let params = new HttpParams();
  
  if (parametros) {
    for (const prop in parametros) {
      if (parametros[prop] !== '' && parametros[prop] !== null && parametros[prop] !== undefined) {
        params = params.append(prop, parametros[prop]);
      }
    }
  }
  
  return this.http.get<TipoCaso[]>(`${_SERVER}/api/caso/cliente/${idCliente}`, { params: params });
}


  buscarPorTecnico(idTecnico: string, parametros?: any) {
  let params = new HttpParams();

  if (parametros) {
    for (const prop in parametros) {
      if (parametros[prop] !== '' && parametros[prop] !== null && parametros[prop] !== undefined) {
        params = params.append(prop, parametros[prop]);
      }
    }
  }

  console.log(' Llamada buscarPorTecnico =>', idTecnico, parametros);

  return this.http.get<TipoCaso[]>(`${_SERVER}/api/caso/tecnico/${idTecnico}`, { params: params });
}


  historial(idCaso: number) {
    return this.http.get<TipoHistorial[]>(`${_SERVER}/api/caso/historial/${idCaso}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  cambiarEstado(idCaso: number, payload: { estado: number, idResponsable: string, descripcion: string }) {
    return this.http.post<any>(`${_SERVER}/api/caso/estado/${idCaso}`, payload);
  }

  consultarEstado(idCaso: number) {
    return this.http.get<any>(`${_SERVER}/api/caso/estado/${idCaso}`);
  }

  /**
   * Verifica si el usuario actual puede crear casos
   */
  puedeCrear(): boolean {
    const usuario = this.authService.userActual;
    return [1, 2].includes(usuario.rol);
  }

  /**
   * puede editar un caso específico, dependiendo del rol
   */
  puedeEditar(caso: TipoCaso): boolean {
    const usuario = this.authService.userActual;
    
    switch (usuario.rol) {
      case 1: // Admin
      case 2: // Oficinista
        return true; //peditar cualquier caso
        
      case 3: // Técnico
      case 4: // Cliente
       
        
      default:
        return false;
    }
  }

  /**
   * Verifica si el usuario actual puede eliminar un caso específico
   */
  puedeEliminar(caso: TipoCaso): boolean {
    const usuario = this.authService.userActual;
    
    switch (usuario.rol) {
      case 1: // Admin
      case 2: // Oficinista
        return true; 
  
      case 3: // Técnico
      case 4: // Cliente
      default:
        return false; // Otros roles no pueden eliminar
    }
  }

  /**
   * Verifica si el usuario actual puede cambiar el estado de un caso
   */
  puedeCambiarEstado(caso: TipoCaso): boolean {
    const usuario = this.authService.userActual;
    
    switch (usuario.rol) {
      case 1: // Admin
      case 2: // Oficinista
        return true; // Pueden cambiar estado de cualquier caso
        
      case 3: // Técnico
        return caso.idTecnico === usuario.idUsuario; 
        
      case 4: // Cliente
      default:
        return false; // Clientes no pueden cambiar estados
    }
  }

  private handleError(error: any) {
    return throwError(() => {
      console.error('Error en CasoService:', error);
      return error;
    });
  }
}
