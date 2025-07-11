import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoArtefacto } from '../../shared/models/interfaces';
import { ArtefactoService } from '../../shared/services/artefacto-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmArtefacto } from '../forms/frm-artefacto/frm-artefacto';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { ObjectViewer } from '../forms/object-viewer/object-viewer';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PrintService } from '../../shared/services/print-service';
import { AuthService } from '../../shared/services/auth-service';

@Component({
  selector: 'app-artefacto',
  imports: [MatCardModule, MatTableModule, MatIconModule,
    MatExpansionModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, RouterModule],
  templateUrl: './artefacto.html',
  styleUrl: './artefacto.css'
})
export class Artefacto implements AfterViewInit {

  private readonly artefactoSrv = inject(ArtefactoService);
  private readonly printSrv = inject(PrintService);
  private readonly dialogo = inject(MatDialog);
  public readonly srvAuth = inject(AuthService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);

  columnas: string[] = ['serie', 'marca', 'modelo', 'categoria', 'descripcion', 'idCliente',
    'botonera'];

  dataSource = signal(new MatTableDataSource<TipoArtefacto>());

  filtro: any;

  mostraDialogo(titulo: string, datos?: TipoArtefacto) {
    const dialogoRef = this.dialogo.open(FrmArtefacto,
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
    this.filtro = { serie: '', marca: '', modelo: '' };
    this.filtrar();
  }

  filtrar() {
    this.artefactoSrv.filtrar(this.filtro).subscribe({
      next:
        (data) => {
          //console.log(data)
          this.dataSource.set(data);
        },
      error: (err) => console.log(err)
    });
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fserie') as HTMLInputElement).value = '';
    (document.querySelector('#fmarca') as HTMLInputElement).value = '';
    (document.querySelector('#fmodelo') as HTMLInputElement).value = '';
  }

  onNuevo() {
    this.mostraDialogo('Nuevo Artefacto');
  }

  onEditar(id: number) {
    this.artefactoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.mostraDialogo('Editar Artefacto', data);
        }
      })
  }

  onInfo(id: number) {
    this.artefactoSrv.buscar(id)
      .subscribe({
        next: (data) => {
          this.dialogo.open(ObjectViewer, {
            width: '50vw',
            maxWidth: '35rem',
            data: {
              title: 'Información del Artefacto',
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

  onEliminar(id: number) {
    const dialogRef = this.dialogo.open(DialogoGeneral, {
      data: {
        texto: '¿Eliminar artefacto seleccionado?',
        icono: 'question_mark',
        textoAceptar: 'Si',
        textoCancelar: 'No',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.artefactoSrv.eliminar(id)
          .subscribe({
            next: (res: any) => {
              this.resetearFiltro();
              this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: 'Artefacto eliminado correctamente',
                  icono: 'check',
                  textoAceptar: 'Aceptar'
                }
              })
            },
            error: (err) => {
              this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: 'Error al eliminar artefacto. Inténtelo de nuevo.',
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
      'Serie', 'Marca', 'Modelo', 'Categoría', 'Descripción', 'ID Cliente'
    ];
    this.artefactoSrv.filtrar(this.filtro)
      .subscribe({
        next: (data) => {
          const cuerpo = Object(data).map((Obj: any) => {
            const datos = [
              Obj.serie,
              Obj.marca,
              Obj.modelo,
              Obj.categoria,
              Obj.descripcion,
              Obj.idCliente
            ];
            return datos;
          });
          this.printSrv.print(encabezado, cuerpo, 'Listado de Artefactos', true);
        },
        error: (err) => console.error(err)
      });
  }

  ngAfterViewInit(): void {
    this.filtro = { serie: '', marca: '', modelo: '' };
    this.filtrar();
  }

}
