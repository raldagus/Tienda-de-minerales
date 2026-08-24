import { Routes } from '@angular/router';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { HomeComponent } from './pages/home/home.component';
import { DiccionarioComponent } from './pages/diccionario/diccionario.component'; 
import { SobreNosotrosComponent } from './pages/sobre-nosotros/sobre-nosotros.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'catalogo', component: CatalogoComponent },
    { path: 'diccionario', component: DiccionarioComponent },
    { path: 'sobre-nosotros', component: SobreNosotrosComponent },
    { path: 'producto/:id', loadComponent: () => import('./pages/vista-individual/vista-individual')
    .then(m => m.VistaIndividual) 
    }
];
