import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../shared/services/auth-service';

@Component({
  selector: 'app-frm-login',
  standalone: true,
  imports: [
    MatDialogModule, MatIconModule, MatButtonModule, MatFormFieldModule,
    ReactiveFormsModule, MatInputModule, MatDividerModule
  ],
  templateUrl: './frm-login.html',
  styleUrls: ['./frm-login.css']
})
export class FrmLogin {
  readonly dialogRef = inject(MatDialogRef<FrmLogin>);
  frmLogin: FormGroup;
  private builder = inject(FormBuilder);
  private svrAuth = inject(AuthService);
  public errorLogin = signal(false);

  constructor() {
    this.frmLogin = this.builder.group({
      id: [0],
      idUsuario: [''],
      passw: ['']
    });
  }

  onLogin() {
    delete this.frmLogin.value.id;
    this.svrAuth.login(this.frmLogin.value)
      .subscribe((res) => {
        console.log('Login res:', res); //  true o 401
        this.errorLogin.set(res !== true); // Error si no es true
        if (res === true) {
          this.dialogRef.close();
        }
      });
  }
}
