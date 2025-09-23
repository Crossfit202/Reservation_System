import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../Models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
    private apiUrl = 'http://localhost:8080/api/reservations';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(this.apiUrl);
    }

    get(id: number): Observable<Reservation> {
        return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
    }

    create(reservation: Reservation): Observable<Reservation> {
        return this.http.post<Reservation>(this.apiUrl, reservation);
    }

    update(id: number, reservation: Reservation): Observable<Reservation> {
        return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservation);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}