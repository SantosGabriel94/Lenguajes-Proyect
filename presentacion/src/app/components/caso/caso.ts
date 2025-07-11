import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoCaso } from '../../shared/models/interfaces';
import { CasoService } from '../../shared/services/caso-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth-service';
import { PrintService } from '../../shared/services/print-service';
import { FrmCaso } from '../forms/frm-caso/frm-caso';
import { ObjectViewer } from '../forms/object-viewer/object-viewer';
import { HistorialCaso } from '../forms/historial-caso/historial-caso';
import { CambioEstadoCaso } from '../forms/cambio-estado-caso/cambio-estado-caso';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-caso',
  imports: [
    MatCardModule, MatTableModule, MatIconModule, MatExpansionModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule
  ],
  templateUrl: './caso.html',
  styleUrl: './caso.css'
})
export class Caso implements AfterViewInit {

  private readonly casoSrv = inject(CasoService);
  private readonly printSrv = inject(PrintService);
  private readonly dialogo = inject(MatDialog);
  public readonly srvAuth = inject(AuthService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);

  columnas: string[] = ['id', 'idTecnico', 'idArtefacto', 'descripcion', 'fechaEntrada', 'estadoActual', 'fechaSalida', 'botonera'];
  dataSource = signal(new MatTableDataSource<TipoCaso>());
  filtro: any = {};

  mostraDialogo(titulo: string, datos?: TipoCaso) {
    const dialogoRef = this.dialogo.open(FrmCaso, {
      width: '50vw',
      maxWidth: '35rem',
      data: {
        title: titulo,
        datos: datos
      },
      disableClose: true,
    });
    dialogoRef.afterClosed()
      .subscribe({
        next: (res) => {
          if (res !== false) {
            this.resetearFiltro();
          }
        },
        error: (err) => (console.log(err))
      });
  }

  resetearFiltro() {
    this.filtro = { codigo: '', idTecnico: '', idArtefacto: '', descripcion: '' };
    this.filtrar();
  }

  filtrar() {
    // Usar filtrarPorRol para aplicar la lógica de permisos según el rol del usuario
    this.casoSrv.filtrarPorRol(this.filtro).subscribe({
      next: (data) => {
        // Obtener el estado actual de cada caso consultando el endpoint específico
        this.obtenerEstadosActuales(data);
      },
      error: (err) => {
        console.error('Error al filtrar casos:', err);
        // En caso de error, mostrar tabla vacía
        this.dataSource.set(new MatTableDataSource<TipoCaso>([]));
      }
    });
  }

  private obtenerEstadosActuales(casos: TipoCaso[]) {
  if (!casos || !Array.isArray(casos) || casos.length === 0) {
    this.dataSource.set(new MatTableDataSource<TipoCaso>([]));
    return;
  }

  const estadoObservables = casos.map(caso => 
    this.casoSrv.consultarEstado(caso.id!)
  );

  forkJoin(estadoObservables).subscribe({
    next: (estados) => {
      const casosConEstado: TipoCaso[] = casos.map((caso, index) => {
        const estadoData = estados[index];
        
        return {
          ...caso,
          estadoActual: estadoData?.estadoActual || 0,
          estadoTexto: estadoData?.estadoTexto || this.obtenerTextoEstado(estadoData?.estadoActual || 0),
          ultimaActualizacion: estadoData?.ultimaActualizacion
        };
      });

      this.dataSource.set(new MatTableDataSource<TipoCaso>(casosConEstado));
      this.dataSource().paginator = this.paginator;
      this.dataSource().data = [...casosConEstado];
    },
    error: (err) => {
      console.error('Error al obtener estados:', err);
      this.dataSource.set(new MatTableDataSource<TipoCaso>(casos));
      this.dataSource().paginator = this.paginator;
    }
  });
}


  private obtenerTextoEstado(estado: number): string {
    switch(estado) {
      case 0: return 'Aceptado';
      case 1: return 'Diagnosticado';
      case 2: return 'Esperando Aprobación';
      case 3: return 'Esperando Repuesto';
      case 4: return 'Reparado';
      case 5: return 'Sin Solución';
      case 6: return 'Entregado';
      default: return 'Aceptado';
    }
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fcodigo') as HTMLInputElement).value = '';
    (document.querySelector('#fidTecnico') as HTMLInputElement).value = '';
    (document.querySelector('#fidArtefacto') as HTMLInputElement).value = '';
    (document.querySelector('#fdescripcion') as HTMLInputElement).value = '';
  }

  onNuevo() {
    // checa permisos antes de permitir crear
    if (!this.casoSrv.puedeCrear()) {
      this.dialogo.open(DialogoGeneral, {
        data: {
          texto: 'No tienes permisos para crear casos',
          icono: 'error',
          textoAceptar: 'Aceptar'
        }
      });
      return;
    }
    
    this.mostraDialogo('Nuevo Caso');
  }

  onEditar(id: number) {
    this.casoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          // Verificar permisos antes de permitir editar
          if (!this.casoSrv.puedeEditar(data)) {
            this.dialogo.open(DialogoGeneral, {
              data: {
                texto: 'No tienes permisos para editar este caso',
                icono: 'error',
                textoAceptar: 'Aceptar'
              }
            });
            return;
          }
          
          this.mostraDialogo('Editar Caso', data);
        },
        error: (err) => console.error(err)
      });
  }

  onInfo(id: number) {
    this.casoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.dialogo.open(ObjectViewer, {
            width: '50vw',
            maxWidth: '35rem',
            data: {
              title: 'Información del Caso',
              datos: data,
              icono: 'info'
            },
            disableClose: false
          });
        },
        error: (err) => console.error(err)
      });
  }

  onFiltroChange(f: any) {
    this.filtro = f;
    this.filtrar();
  }

  onEliminar(id: number) {
    this.casoSrv.buscar(id)
      .subscribe({
        next: (caso) => {
          // Verificalos  permisos antes de permitir eliminar
          if (!this.casoSrv.puedeEliminar(caso)) {
            this.dialogo.open(DialogoGeneral, {
              data: {
                texto: 'No tienes permisos para eliminar este caso',
                icono: 'error',
                textoAceptar: 'Aceptar'
              }
            });
            return;
          }

          const dialogRef = this.dialogo.open(DialogoGeneral, {
            data: {
              texto: '¿Eliminar caso seleccionado?',
              icono: 'question_mark',
              textoAceptar: 'Si',
              textoCancelar: 'No',
            }
          });
          
          dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
              this.casoSrv.eliminar(id)
                .subscribe({
                  next: (res: any) => {
                    this.resetearFiltro();
                    this.dialogo.open(DialogoGeneral, {
                      data: {
                        texto: 'Caso eliminado correctamente',
                        icono: 'check',
                        textoAceptar: 'Aceptar'
                      }
                    });
                  },
                  error: (err) => {
                    this.dialogo.open(DialogoGeneral, {
                      data: {
                        texto: 'Error al eliminar caso. Inténtelo de nuevo.',
                        icono: 'error',
                        textoAceptar: 'Aceptar'
                      }
                    });
                  }
                });
            }
          });
        },
        error: (err) => console.error(err)
      });
  }

  onImprimir() {
    const encabezado = [
      'ID', 'Técnico', 'Artefacto', 'Descripción', 'Fecha Entrada', 'Estado Actual', 'Fecha Salida'
    ];
    
    // Usa los datos ya procesados del dataSource que tienen los estados actualizados
    const casosActuales = this.dataSource().data;
    
    if (casosActuales.length === 0) {
      console.warn('No hay casos para imprimir');
      return;
    }
    
    const cuerpo = casosActuales.map((caso: TipoCaso) => {
      const datos = [
        caso.id || '',
        caso.idTecnico || '',
        caso.idArtefacto || '',
        caso.descripcion || '',
        caso.fechaEntrada ? new Date(caso.fechaEntrada).toLocaleDateString('es-ES') : '',
        caso.estadoTexto || this.obtenerTextoEstado(caso.estadoActual || 0),
        caso.fechaSalida ? new Date(caso.fechaSalida).toLocaleDateString('es-ES') : 'Pendiente'
      ];
      return datos;
    });
    
    this.printSrv.print(encabezado, cuerpo, 'Listado de Casos', true);
  }

  getEstadoClass(estado?: number): string {
    switch(estado) {
      case 0: return 'badge-aceptado';
      case 1: return 'badge-diagnosticado';
      case 2: return 'badge-espera-aprobacion';
      case 3: return 'badge-espera-repuesto';
      case 4: return 'badge-reparado';
      case 5: return 'badge-sin-solucion';
      case 6: return 'badge-entregado';
      default: return 'badge-aceptado';
    }
  }

  //  verificar si existen permisos en el template
  puedeCrear(): boolean {
    return this.casoSrv.puedeCrear();
  }

  puedeEditar(caso: TipoCaso): boolean {
    return this.casoSrv.puedeEditar(caso);
  }

  puedeEliminar(caso: TipoCaso): boolean {
    return this.casoSrv.puedeEliminar(caso);
  }

  puedeCambiarEstado(caso: TipoCaso): boolean {
    return this.casoSrv.puedeCambiarEstado(caso);
  }

  abrirHistorial(caso: TipoCaso): void {
    if (!caso.id) {
      console.error('ID de caso no válido:', caso);
      return;
    }

    
    const dialogoRef = this.dialogo.open(HistorialCaso, {
      width: '90vw',
      maxWidth: '600px',
      height: '80vh',
      data: {
        idCaso: caso.id,
        codigo: caso.id
      },
      disableClose: false
    });
  }

  abrirCambioEstado(caso: TipoCaso): void {
    const dialogoRef = this.dialogo.open(CambioEstadoCaso, {
      width: '90vw',
      maxWidth: '500px',
      data: {
        idCaso: caso.id,
        codigo: caso.id,
        estadoActual: caso.estadoActual || 0
      },
      disableClose: false
    });

    dialogoRef.afterClosed().subscribe(result => {
      if (result && result.cambiado) {
        // Reload los datos para mostrar el nuevo estado
        this.filtrar();
      }
    });
  }

  ngAfterViewInit(): void {
    this.filtro = { codigo: '', idTecnico: '', idArtefacto: '', descripcion: '' };
    this.filtrar();
  }
}
