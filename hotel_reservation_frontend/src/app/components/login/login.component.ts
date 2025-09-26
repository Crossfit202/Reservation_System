import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (token: string) => {
        localStorage.setItem('jwt', token);
        this.router.navigate(['/']);
      },
      error: () => this.error = 'Invalid credentials'
    });
  }
}
