import { Routes } from '@angular/router';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { HomeComponent } from './pages/home/home.component';
import { DiccionarioComponent } from './pages/diccionario/diccionario.component';
import { SobreNosotrosComponent } from './pages/sobre-nosotros/sobre-nosotros.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'catalogo', component: CatalogoComponent },
    { path: 'diccionario', component: DiccionarioComponent },
    { path: 'sobre-nosotros', component: SobreNosotrosComponent },
    { path: 'producto/:id', loadComponent: () => import('./pages/vista-individual/vista-individual')
    .then(m => m.VistaIndividual)
    },
    { path: 'admin/login', loadComponent: () => import('./pages/admin-login/admin-login')
    .then(m => m.AdminLogin)
    },
    { path: 'admin/pedidos', canActivate: [authGuard], loadComponent: () => import('./pages/admin-pedidos/admin-pedidos')
    .then(m => m.AdminPedidos)
    }
];
