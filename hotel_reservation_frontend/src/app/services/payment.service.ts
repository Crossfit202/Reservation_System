import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../Models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
    private apiUrl = 'http://localhost:8080/api/payments';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Payment[]> {
        return this.http.get<Payment[]>(this.apiUrl);
    }

    get(id: number): Observable<Payment> {
        return this.http.get<Payment>(`${this.apiUrl}/${id}`);
    }

    create(payment: Payment): Observable<Payment> {
        return this.http.post<Payment>(this.apiUrl, payment);
    }

    update(id: number, payment: Payment): Observable<Payment> {
        return this.http.put<Payment>(`${this.apiUrl}/${id}`, payment);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}