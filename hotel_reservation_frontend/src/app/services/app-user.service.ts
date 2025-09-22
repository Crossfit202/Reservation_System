import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppUser } from '../Models/app-user.model';

@Injectable({ providedIn: 'root' })
export class AppUserService {
    private apiUrl = 'http://localhost:8080/api/appusers';

    constructor(private http: HttpClient) { }

    getAll(): Observable<AppUser[]> {
        return this.http.get<AppUser[]>(this.apiUrl);
    }

    get(id: number): Observable<AppUser> {
        return this.http.get<AppUser>(`${this.apiUrl}/${id}`);
    }

    create(user: AppUser): Observable<AppUser> {
        return this.http.post<AppUser>(this.apiUrl, user);
    }

    update(id: number, user: AppUser): Observable<AppUser> {
        return this.http.put<AppUser>(`${this.apiUrl}/${id}`, user);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}