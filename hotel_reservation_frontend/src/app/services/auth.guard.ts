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
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000); // current time in seconds
      if (payload.exp && now > payload.exp) {
        localStorage.removeItem('jwt');
        this.router.navigate(['/login']);
        return false;
      }
      // Optionally check roles here
      return true;
    } catch (e) {
      localStorage.removeItem('jwt');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
