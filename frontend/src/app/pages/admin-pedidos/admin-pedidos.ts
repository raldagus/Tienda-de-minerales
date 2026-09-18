import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [],
  templateUrl: './admin-pedidos.html',
  styleUrl: './admin-pedidos.scss',
})
export class AdminPedidos {
  private authService = inject(AuthService);
  private router = inject(Router);

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigateByUrl('/admin/login');
  }
}
