import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoCliente } from '../../shared/models/interfaces';
import { ClienteService } from '../../shared/services/cliente-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmCliente } from '../forms/frm-cliente/frm-cliente';
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
  selector: 'app-cliente',
  imports: [MatCardModule, MatTableModule, MatIconModule,
    MatExpansionModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, RouterModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.css'
})
export class Cliente implements AfterViewInit {
  private readonly clienteSrv = inject(ClienteService);
  private readonly usuarioSrv = inject(UsuarioService);
  private readonly printSrv = inject(PrintService);
  private readonly dialogo = inject(MatDialog);
  public readonly srvAuth = inject(AuthService)

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);

  columnas: string[] = ['idCliente', 'nombre', 'apellido1', 'apellido2', 'celular', 'correo',
    'botonera'];

  dataSource = signal(new MatTableDataSource<TipoCliente>());

  filtro: any;

  mostraDialogo(titulo: string, datos?: TipoCliente) {
    const dialogoRef = this.dialogo.open(FrmCliente,
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
    this.filtro = { idCliente: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }

  filtrar() {
    this.clienteSrv.filtrar(this.filtro).subscribe({
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
    this.mostraDialogo('Nuevo Cliente');
  }

  onEditar(id: number) {
    this.clienteSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostraDialogo('Editar Cliente', data);
        }
      })
  }

  onInfo(id: number) {
    this.clienteSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.dialogo.open(ObjectViewer, {
            width: '50vw',
            maxWidth: '35rem',
            data: {
              title: 'Información del Cliente',
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
    this.clienteSrv.buscar(id)
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
              this.usuarioSrv.resetearPassw(data.idCliente)
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
        this.clienteSrv.eliminar(id)
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
                  texto: 'Error al eliminar cliente. Inténtelo de nuevo.',
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
      'IdCliente', 'Nombre', 'Teléfono', 'Celular', 'Correo'
    ];
    this.clienteSrv.filtrar(this.filtro)
      .subscribe({
        next: (data) => {
          const cuerpo = Object(data).map((Obj: any) => {
            const datos = [
              Obj.idCliente,
              `${Obj.nombre} ${Obj.apellido1} ${Obj.apellido2}`,
              Obj.telefono,
              Obj.celular,
              Obj.correo
            ];
            return datos;
          });
          this.printSrv.print(encabezado, cuerpo, 'Listado de Clientes', true);
        },
        error: (err) => console.error(err)
      });
  }

  ngAfterViewInit(): void {
    this.filtro = { idCliente: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }

}
