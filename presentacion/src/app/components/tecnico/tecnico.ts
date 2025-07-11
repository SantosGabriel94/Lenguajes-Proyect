import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoTecnico } from '../../shared/models/interfaces';
import { TecnicoService } from '../../shared/services/tecnico-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmTecnico } from '../forms/frm-tecnico/frm-tecnico';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { UsuarioService } from '../../shared/services/usuario-service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PrintService } from '../../shared/services/print-service';
import { AuthService } from '../../shared/services/auth-service';
import { ObjectViewer } from '../forms/object-viewer/object-viewer';

@Component({
  selector: 'app-tecnico',
  imports: [MatCardModule, MatTableModule, MatIconModule,
    MatExpansionModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, RouterModule],
  templateUrl: './tecnico.html',
  styleUrl: './tecnico.css'
})
export class Tecnico implements AfterViewInit {

  private readonly tecnicoSrv = inject(TecnicoService);
  private readonly usuarioSrv = inject(UsuarioService);
  private readonly printSrv = inject(PrintService);
  private readonly dialogo = inject(MatDialog);
  public readonly srvAuth = inject(AuthService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);

  columnas: string[] = ['idTecnico', 'nombre', 'apellido1', 'apellido2', 'celular', 'correo',
    'botonera'];

  dataSource = signal(new MatTableDataSource<TipoTecnico>());
  filtro: any;

  mostraDialogo(titulo: string, datos?: TipoTecnico) {
    const dialogoRef = this.dialogo.open(FrmTecnico,
      {
        width: '50vw',
        maxWidth: '35rem',
        data: {
          title: titulo,
          datos: datos
        },
        disableClose: true,
      }
    );
    dialogoRef.afterClosed()
      .subscribe({
        next: (res) => {
          if (res != false) {
            this.resetearFiltro();
          }
        },
        error: (err) => (console.log(err))
      })
  }

  resetearFiltro() {
    this.filtro = { idTecnico: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }

  filtrar() {
    this.tecnicoSrv.filtrar(this.filtro).subscribe({
      next:
        (data) => {
          
          this.dataSource.set(data);
        },
      error: (err) => console.log(err)
    });
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fidUsuario') as HTMLInputElement).value = '';
    (document.querySelector('#fnombre') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido1') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido2') as HTMLInputElement).value = '';
  }

  onNuevo() {
    this.mostraDialogo('Nuevo Tecnico');
  }

  onEditar(id: number) {
    this.tecnicoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostraDialogo('Editar Tecnico', data);
        }
      })
  }

  onInfo(id: number) {
    this.tecnicoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.dialogo.open(ObjectViewer, {
            width: '50vw',
            maxWidth: '35rem',
            data: {
              title: 'Información del Técnico',
              datos: data,
              icono: 'info'
            },
            disableClose: false
          });
        },
        error: (err) => console.error(err)
      })
  }

  onFiltroChange(f: any) {
    this.filtro = f;
    this.filtrar();
  }

  onResetearPassword(id: number) {
    this.tecnicoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          const dialogRef = this.dialogo.open(DialogoGeneral, {
            data: {
              texto: `Resetear contraseña de ${data.nombre}?`,
              icono: 'question_mark',
              textoAceptar: 'Si',
              textoCancelar: 'No',
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
              this.usuarioSrv.resetearPassw(data.idTecnico)
                .subscribe(() => {

                  this.dialogo.open(DialogoGeneral, {
                    data: {
                      texto: 'Contraseña Restablecida',
                      icono: 'check',
                      textoAceptar: 'Aceptar'
                    }
                  })
                })

            }
          });

        }
      })
  }

  onEliminar(id: number) {
    const dialogRef = this.dialogo.open(DialogoGeneral, {
      data: {
        texto: '¿Eliminar registro seleccionado?',
        icono: 'question_mark',
        textoAceptar: 'Si',
        textoCancelar: 'No',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.tecnicoSrv.eliminar(id)
          .subscribe({
            next: (res: any) => {
              this.resetearFiltro();
              this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: 'Registro eliminado correctamente',
                  icono: 'check',
                  textoAceptar: 'Aceptar'
                }
              })
            },
            error: (err) => {
              this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: 'Error al eliminar técnico. Inténtelo de nuevo.',
                  icono: 'error',
                  textoAceptar: 'Aceptar'
                }
              });
            }
          })
      }
    })
  }



  onImprimir() {
    const encabezado = [
      'IdTecnico', 'Nombre', 'Teléfono', 'Celular', 'Correo'
    ];
    this.tecnicoSrv.filtrar(this.filtro)
      .subscribe({
        next: (data) => {
          const cuerpo = Object(data).map((Obj: any) => {
            const datos = [
              Obj.idTecnico,
              `${Obj.nombre} ${Obj.apellido1} ${Obj.apellido2}`,
              Obj.telefono,
              Obj.celular,
              Obj.correo
            ];
            return datos;
          });
          this.printSrv.print(encabezado, cuerpo, 'Listado de Tecnicos', true);
        },
        error: (err) => console.error(err)
      });
  }

  ngAfterViewInit(): void {
    this.filtro = { idTecnico: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }


}
