import { Component, inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ArtefactoService } from '../../../shared/services/artefacto-service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';

@Component({
  selector: 'app-frm-artefacto',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatInputModule, ReactiveFormsModule,
    MatFormFieldModule
  ],
  templateUrl: './frm-artefacto.html',
  styleUrl: './frm-artefacto.css'
})
export class FrmArtefacto implements OnInit {
  titulo!: string;

  private srvArtefacto = inject(ArtefactoService);
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  dialogRef = inject(MatDialogRef<FrmArtefacto>);

  private builder = inject(FormBuilder);
  myForm: FormGroup;

  constructor(){
    this.myForm = this.builder.group({
      id: [0],
      idCliente: ['',[Validators.required, Validators.pattern('[0-9]*')]],
      serie: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      marca: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(15)]],
      modelo: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(15)]],
      categoria: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      descripcion: ['',[Validators.required, Validators.minLength(5), Validators.maxLength(50)]]
    });
  }

  get F(){
    return this.myForm.controls;
  }

  onGuardar() {
    if (this.myForm.value.id === 0) {
      this.srvArtefacto.guardar(this.myForm.value)?.subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral,{
              data:{
                texto:'Artefacto insertado correctamente',
                icono:'check',
                textoAceptar: 'Aceptar'
              }
            })
            this.dialogRef.close();
        },
        error: (err) => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Error al insertar artefacto. Inténtelo de nuevo.',
              icono: 'error',
              textoAceptar: 'Aceptar'
            }
          });
        }
      });
   
    } else{
      this.srvArtefacto.guardar(this.myForm.value, this.myForm.value.id)
        ?.subscribe({
          complete: () => {
            this.dialog.open(DialogoGeneral,{
              data:{
                texto:'Artefacto modificado correctamente',
                icono:'check',
                textoAceptar: 'Aceptar'
              }
            })
            this.dialogRef.close();
          },
          error: (err) => {
            this.dialog.open(DialogoGeneral, {
              data: {
                texto: 'Error al modificar artefacto. Inténtelo de nuevo.',
                icono: 'error',
                textoAceptar: 'Aceptar'
              }
            });
          }
        });
    }
  };

  ngOnInit(): void{
    this.titulo = this.data.title;
    //console.log(this.data);
    if(this.data.datos){
      this.myForm.setValue({
        id: this.data.datos.id,
        idCliente: this.data.datos.idCliente,
        serie: this.data.datos.serie,
        marca: this.data.datos.marca,
        modelo: this.data.datos.modelo,
        categoria: this.data.datos.categoria,
        descripcion: this.data.datos.descripcion
      });
    }
  };

}
