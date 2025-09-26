import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:8080/api/auth';

    constructor(private http: HttpClient) { }

    login(email: string, password: string) {
        return this.http.post(`${this.apiUrl}/login`, { email, password }, { responseType: 'text' });
    }

    register(email: string, password: string, name: string) {
        return this.http.post(`${this.apiUrl}/register`, { email, password, name }, { responseType: 'text' });
    }
}