import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AdminService } from '../../../shared/services/admin-service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';

@Component({
  selector: 'app-frm-admin',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatInputModule, ReactiveFormsModule,
    MatFormFieldModule],
  templateUrl: './frm-admin.html',
  styleUrl: './frm-admin.css'
})
export class FrmAdmin implements OnInit {

  titulo!: string;

  private srvAdmin = inject(AdminService); 
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  dialogRef = inject(MatDialogRef<FrmAdmin>);

  private builder = inject(FormBuilder);
  myForm: FormGroup;

  constructor() {
    this.myForm = this.builder.group({
      id: [0],
      idAdmin: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(15),
        Validators.pattern('[0-9]*')]],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30),
        Validators.pattern('^([A-Za-zÑñáéíóúÁÉÍÓÚ]+)( [A-Za-zÑñáéíóúÁÉÍÓÚ]+)?$')]],
      apellido1: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30),
        Validators.pattern('^[A-Za-zÑñáéíóúÁÉÍÓÚ]+$')]],
      apellido2: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30),
        Validators.pattern('^[A-Za-zÑñáéíóúÁÉÍÓÚ]+$')]],
      telefono: ['', Validators.pattern('^[0-9]{8}$')],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  get F() {
    return this.myForm.controls;
  }

  onGuardar() {
    if (this.myForm.value.id === 0) {
      this.srvAdmin.guardar(this.myForm.value)?.subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Registro insertado correctamente',
              icono: 'check',
              textoAceptar: 'Aceptar'
            }
          });
          this.dialogRef.close();
        },
        error: (err) => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Error al insertar registro. Inténtelo de nuevo.',
              icono: 'error',
              textoAceptar: 'Aceptar'
            }
          });
        }
      });
    } else {
      this.srvAdmin.guardar(this.myForm.value, this.myForm.value.id)
        ?.subscribe({
          complete: () => {
            this.dialog.open(DialogoGeneral, {
              data: {
                texto: 'Registro modificado correctamente',
                icono: 'check',
                textoAceptar: 'Aceptar'
              }
            });
            this.dialogRef.close();
          },
          error: (err) => {
            this.dialog.open(DialogoGeneral, {
              data: {
                texto: 'Error al modificar registro. Inténtelo de nuevo.',
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
    if (this.data.datos) {
      this.myForm.setValue({
        id: this.data.datos.id,
        idAdmin: this.data.datos.idAdmin,
        nombre: this.data.datos.nombre,
        apellido1: this.data.datos.apellido1,
        apellido2: this.data.datos.apellido2,
        telefono: this.data.datos.telefono,
        celular: this.data.datos.celular,
        correo: this.data.datos.correo
      });
    }
  }
}
