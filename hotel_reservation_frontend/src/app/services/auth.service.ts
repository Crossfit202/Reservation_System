import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:8080/api/auth';
    private userEmailSubject: BehaviorSubject<string | null>;
    public userEmail$: Observable<string | null>;
    private userRoleSubject: BehaviorSubject<string | null>;
    public userRole$: Observable<string | null>;

    constructor(private http: HttpClient) {
        this.userEmailSubject = new BehaviorSubject<string | null>(this.getUserEmailFromJwt());
        this.userEmail$ = this.userEmailSubject.asObservable();
        this.userRoleSubject = new BehaviorSubject<string | null>(this.getUserRoleFromJwt());
        this.userRole$ = this.userRoleSubject.asObservable();
    }

    login(email: string, password: string) {
        return this.http.post(`${this.apiUrl}/login`, { email, password }, { responseType: 'text' });
    }

    register(email: string, password: string, name: string) {
        return this.http.post(`${this.apiUrl}/register`, { email, password, name }, { responseType: 'text' });
    }

    setJwt(token: string) {
        localStorage.setItem('jwt', token);
        this.userEmailSubject.next(this.getUserEmailFromJwt());
        this.userRoleSubject.next(this.getUserRoleFromJwt());
    }

    signOut() {
        localStorage.removeItem('jwt');
        this.userEmailSubject.next(null);
        this.userRoleSubject.next(null);
    }

    getUserEmailFromJwt(): string | null {
        const token = localStorage.getItem('jwt');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.sub || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    getUserRoleFromJwt(): string | null {
        const token = localStorage.getItem('jwt');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Adjust the key below if your JWT uses 'roles' or another key
                return payload.role || (payload.roles ? payload.roles[0] : null) || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}


