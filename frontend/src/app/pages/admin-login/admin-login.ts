import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const USUARIO_DEMO = 'demo';
const PASSWORD_DEMO = 'demo1234';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = signal(USUARIO_DEMO);
  password = signal(PASSWORD_DEMO);
  enviando = signal(false);
  error = signal<string | null>(null);

  ingresar(): void {
    this.enviando.set(true);
    this.error.set(null);

    this.authService.login(this.usuario(), this.password()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigateByUrl('/admin/pedidos');
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(err?.error?.mensaje ?? 'No pudimos iniciar sesión. Intentá de nuevo.');
      },
    });
  }
}
