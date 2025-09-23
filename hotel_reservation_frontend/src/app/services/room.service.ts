import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../Models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
    private apiUrl = 'http://localhost:8080/api/rooms';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Room[]> {
        return this.http.get<Room[]>(this.apiUrl);
    }

    get(id: number): Observable<Room> {
        return this.http.get<Room>(`${this.apiUrl}/${id}`);
    }

    create(room: Room): Observable<Room> {
        return this.http.post<Room>(this.apiUrl, room);
    }

    update(id: number, room: Room): Observable<Room> {
        return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}