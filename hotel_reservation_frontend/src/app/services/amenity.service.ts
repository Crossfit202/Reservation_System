import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Amenity } from '../Models/amenity.model';

@Injectable({ providedIn: 'root' })
export class AmenityService {
    private apiUrl = 'http://localhost:8080/api/amenities';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Amenity[]> {
        return this.http.get<Amenity[]>(this.apiUrl);
    }

    get(id: number): Observable<Amenity> {
        return this.http.get<Amenity>(`${this.apiUrl}/${id}`);
    }

    create(amenity: Amenity): Observable<Amenity> {
        return this.http.post<Amenity>(this.apiUrl, amenity);
    }

    update(id: number, amenity: Amenity): Observable<Amenity> {
        return this.http.put<Amenity>(`${this.apiUrl}/${id}`, amenity);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}