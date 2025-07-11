import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FrmLogin } from '../forms/frm-login/frm-login';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [MatDialogModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private readonly dialogo= inject(MatDialog);

  ngOnInit(): void {
    const dialogRef = this.dialogo.open(FrmLogin, {
      width: '450px',
      disableClose: true,

    });
  }
}
