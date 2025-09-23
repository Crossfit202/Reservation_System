import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../Models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
    private apiUrl = 'http://localhost:8080/api/roles';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Role[]> {
        return this.http.get<Role[]>(this.apiUrl);
    }

    get(id: number): Observable<Role> {
        return this.http.get<Role>(`${this.apiUrl}/${id}`);
    }

    create(role: Role): Observable<Role> {
        return this.http.post<Role>(this.apiUrl, role);
    }

    update(id: number, role: Role): Observable<Role> {
        return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}