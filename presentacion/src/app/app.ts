import { Component, OnInit, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { SideNav } from './components/side-nav/side-nav';
import { Header } from './components/header/header'; 
import { AuthService } from './shared/services/auth-service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideNav, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'taller';
  private readonly srvAuth = inject(AuthService);

  ngOnInit() : void {
    initFlowbite();
    this.srvAuth.verificarRefresh();
  }
}
