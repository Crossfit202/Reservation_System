import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuOpen = false;
  userEmail: string | null = null;
  userRole: string | null = null;

  constructor(private router: Router, private authService: AuthService) {
    this.authService.userEmail$.subscribe(email => {
      this.userEmail = email;
    });
    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
  }

  get userInitials(): string {
    if (!this.userEmail) return '';
    // Try to get initials from email prefix or name
    const emailPrefix = this.userEmail.split('@')[0];
    const parts = emailPrefix.split(/[._-]/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return this.userEmail.slice(0, 2).toUpperCase();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  signOut() {
    this.authService.signOut();
    this.closeMenu();
    this.router.navigate(['/login']);
  }
}
