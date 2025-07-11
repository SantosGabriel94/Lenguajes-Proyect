import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../shared/services/auth-service';
import { UsuarioService } from '../../shared/services/usuario-service';
import { FrmChangePassword } from '../forms/frm-change-password/frm-change-password';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatMenuModule, MatDividerModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  srvAuth= inject(AuthService);
  srvUsuario= inject(UsuarioService);
  dialog = inject(MatDialog);

  loggOut() {
    this.srvAuth.loggOut();
  }

  loggIn() {}

  changePassword() {
    // checa si existe un usuario logueado
    const usuarioActual = this.srvAuth.userActual;
    
    if (!usuarioActual.idUsuario) {
      console.error('No hay usuario logueado');
      return;
    }

    
    const dialogRef = this.dialog.open(FrmChangePassword, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // cambio de contraseña
        alert('Contraseña cambiada exitosamente');
      }
    });
  }

}
