import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../shared/services/auth-service';
import { UsuarioService } from '../../../shared/services/usuario-service';

@Component({
  selector: 'app-frm-change-password',
  imports: [MatDialogModule, MatIconModule, MatButtonModule, MatFormFieldModule,
    ReactiveFormsModule, MatInputModule, MatDividerModule],
  templateUrl: './frm-change-password.html',
  styleUrl: './frm-change-password.css'
})
export class FrmChangePassword {
  readonly dialogRef = inject(MatDialogRef<FrmChangePassword>);
  frmChangePassword: FormGroup;
  private builder = inject(FormBuilder);
  private srvAuth = inject(AuthService);
  private srvUsuario = inject(UsuarioService);
  public errorMessage = signal('');
  public isLoading = signal(false);

  constructor() {
    this.frmChangePassword = this.builder.group({
      passwActual: ['', [Validators.required]],
      passwNueva: ['', [Validators.required]],
      passwConfirmar: ['', [Validators.required]]
    });
  }

  onChangePassword() {
    if (this.frmChangePassword.invalid) {
      this.errorMessage.set('Por favor complete todos los campos correctamente');
      return;
    }

    const { passwActual, passwNueva, passwConfirmar } = this.frmChangePassword.value;

    // Validar que las contraseñas nuevas coincidan
    if (passwNueva !== passwConfirmar) {
      this.errorMessage.set('Las contraseñas nuevas no coinciden');
      return;
    }

    const usuarioActual = this.srvAuth.userActual;
    if (!usuarioActual.idUsuario) {
      this.errorMessage.set('No hay usuario logueado');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.srvUsuario.changePassw(usuarioActual.idUsuario, passwActual, passwNueva)
      .subscribe({
        next: (resultado) => {
          this.isLoading.set(false);
          if (resultado === true) {
            // Éxito, cerrar el dialog
            this.dialogRef.close(true);
          } else {
            // Error, al mostrar mensaje según el código de estado
            if (resultado === 401) {
              this.errorMessage.set('Contraseña actual incorrecta');
            } else {
              this.errorMessage.set('Error al cambiar la contraseña');
            }
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error:', error);
          this.errorMessage.set('Error al cambiar la contraseña');
        }
      });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
