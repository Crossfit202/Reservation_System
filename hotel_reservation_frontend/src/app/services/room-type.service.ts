import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomType } from '../Models/room-type.model';

@Injectable({ providedIn: 'root' })
export class RoomTypeService {
    private apiUrl = 'http://localhost:8080/api/room-types';

    constructor(private http: HttpClient) { }

    getAll(): Observable<RoomType[]> {
        return this.http.get<RoomType[]>(this.apiUrl);
    }

    get(id: number): Observable<RoomType> {
        return this.http.get<RoomType>(`${this.apiUrl}/${id}`);
    }

    create(roomType: RoomType): Observable<RoomType> {
        return this.http.post<RoomType>(this.apiUrl, roomType);
    }

    update(id: number, roomType: RoomType): Observable<RoomType> {
        return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}