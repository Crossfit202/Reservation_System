import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('jwt');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    // Optionally: decode token and check roles
    // Example: only allow if token contains "USER" role
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.roles || !payload.roles.includes('USER')) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
