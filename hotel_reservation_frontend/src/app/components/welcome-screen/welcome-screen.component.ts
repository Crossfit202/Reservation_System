import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.css'],
  imports: [RouterModule, CommonModule]
})
export class WelcomeScreenComponent {
  menuOpen = false;
  userEmail: string | null = null;

  constructor(private router: Router) {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userEmail = payload.sub;
      } catch (e) {
        this.userEmail = null;
      }
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  signOut() {
    localStorage.removeItem('jwt');
    this.userEmail = null;
    this.router.navigate(['/login']);
  }

}
