import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CasoService } from '../../../shared/services/caso-service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';
import { AuthService } from '../../../shared/services/auth-service';


@Component({
  selector: 'app-frm-caso',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatInputModule, ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './frm-caso.html',
  styleUrl: './frm-caso.css'
})
export class FrmCaso implements OnInit {
  titulo!: string;

  private srvCaso = inject(CasoService);
  private srvAuth = inject(AuthService);
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  dialogRef = inject(MatDialogRef<FrmCaso>);

  private builder = inject(FormBuilder);
  myForm: FormGroup;

  constructor() {
    this.myForm = this.builder.group({
      id: [0],
      idTecnico: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]],
      idCreador: [''], // Removemos las validaciones ya que se asigna automáticamente
      idArtefacto: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]],
      descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      fechaEntrada: [''],
      fechaSalida: ['']
    });
  }

  get F() {
    return this.myForm.controls;
  }

  get usuarioActual(): string {
    return `${this.srvAuth.userActual.nombre} (${this.srvAuth.userActual.idUsuario})`;
  }

  onGuardar() {
  // Asignar automáticamente el idCreador del usuario logueado
  const datosFormulario = { ...this.myForm.value };
  datosFormulario.idCreador = this.srvAuth.userActual.idUsuario;

  if (!this.myForm.value.id || this.myForm.value.id == 0) {
    this.srvCaso.guardar(datosFormulario)?.subscribe({
      complete: () => {
        this.dialog.open(DialogoGeneral, {
          data: {
            texto: 'Caso insertado correctamente',
            icono: 'check',
            textoAceptar: 'Aceptar'
          }
        });
        this.dialogRef.close();
      },
      error: (err) => {
        this.dialog.open(DialogoGeneral, {
          data: {
            texto: 'Error al insertar caso. Inténtelo de nuevo.',
            icono: 'error',
            textoAceptar: 'Aceptar'
          }
        });
      }
    });
  } else {
    this.srvCaso.guardar(datosFormulario, this.myForm.value.id)?.subscribe({
      complete: () => {
        this.dialog.open(DialogoGeneral, {
          data: {
            texto: 'Caso modificado correctamente',
            icono: 'check',
            textoAceptar: 'Aceptar'
          }
        });
        this.dialogRef.close();
      },
      error: (err) => {
        this.dialog.open(DialogoGeneral, {
          data: {
            texto: 'Error al modificar caso. Inténtelo de nuevo.',
            icono: 'error',
            textoAceptar: 'Aceptar'
          }
        });
      }
    });
  }
}


  ngOnInit(): void {
    this.titulo = this.data.title;
    
    // Asignar automáticamente el idCreador del usuario logueado para casos nuevos
    if (!this.data.datos) {
      this.myForm.patchValue({
        idCreador: this.srvAuth.userActual.idUsuario
      });
    }
    
    if (this.data.datos) {
      this.myForm.setValue({
        id: this.data.datos.id,
        idTecnico: this.data.datos.idTecnico,
        idCreador: this.data.datos.idCreador,
        idArtefacto: this.data.datos.idArtefacto, //  contiene la serie directamente
        descripcion: this.data.datos.descripcion,
        fechaEntrada: this.data.datos.fechaEntrada || '',
        fechaSalida: this.data.datos.fechaSalida || ''
      });
    }
  }
}
