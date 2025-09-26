import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  email = '';
  password = '';
  name = '';
  error = '';
  success = '';

  constructor(private auth: AuthService, private router: Router) { }

  register() {
    this.auth.register(this.email, this.password, this.name).subscribe({
      next: () => {
        this.success = 'Registration successful!';
        this.router.navigate(['/login']);
      },
      error: () => this.error = 'Registration failed'
    });
  }
}
