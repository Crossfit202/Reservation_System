import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppUser {
    id: number;
    email: string;
    // Add other fields as needed
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = 'http://localhost:8080/api/appusers';

    constructor(private http: HttpClient) { }

    getUserByEmail(email: string): Observable<AppUser[]> {
        return this.http.get<AppUser[]>(`${this.apiUrl}?email=${encodeURIComponent(email)}`);
    }
}
