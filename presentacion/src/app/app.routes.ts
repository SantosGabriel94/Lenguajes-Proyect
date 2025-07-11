import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Cliente } from './components/cliente/cliente';
import { Page404 } from './components/page404/page404';
import { Login } from './components/login/login';
import { Role } from './shared/models/role';
import { authGuard } from './shared/helpers/guards/auth-guard';
import { loginGuard } from './shared/helpers/guards/login-guard';
import { Admin } from './components/admin/admin';
import { Oficinista } from './components/oficinista/oficinista';
import { Tecnico } from './components/tecnico/tecnico';
import { Artefacto } from './components/artefacto/artefacto';
import { Caso } from './components/caso/caso';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: 'home', component: Home },
    {path: 'login', component: Login, canActivate: [loginGuard]},
    {path: 'cliente', component: Cliente,
        canActivate: [ authGuard],
        data: {
         roles: [Role.Admin, Role.Oficinista] }
    },
    {path: 'admin', component: Admin,
        canActivate: [ authGuard],
        data: {
         roles: [Role.Admin] 
        }
    },
    {path: 'oficinista', component: Oficinista,
        canActivate: [ authGuard],
        data: {
         roles: [Role.Admin] 
        }
    },
    {path: 'tecnico', component: Tecnico,
        canActivate: [ authGuard],
        data: {
         roles: [Role.Admin, Role.Oficinista] 
        }
    },
    {path: 'artefacto',component: Artefacto,
        canActivate: [ authGuard],
        data: {
         roles: [Role.Admin, Role.Oficinista]
        }
    },
    {path: 'casos', component: Caso,
        canActivate: [ authGuard],
        data: {
         roles: [Role.Admin, Role.Oficinista, Role.Tecnico, Role.Cliente]
        }
    },

    {path: '**', component: Page404}

];
