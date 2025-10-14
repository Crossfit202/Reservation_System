import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../Models/payment.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
    private apiUrl = 'http://localhost:8080/api/payments';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getAll(): Observable<Payment[]> {
        return this.http.get<Payment[]>(this.apiUrl);
    }

    get(id: number): Observable<Payment> {
        return this.http.get<Payment>(`${this.apiUrl}/${id}`);
    }

    create(payment: Payment): Observable<Payment> {
        // Always send reservationId and stripePaymentId explicitly
        const payload: any = {
            ...payment,
            reservationId: payment.reservation?.id,
            stripePaymentId: payment.stripePaymentId
        };
        return this.http.post<Payment>(this.apiUrl, payload);
    }

    update(id: number, payment: Payment): Observable<Payment> {
        const payload: any = { ...payment, reservationId: payment.reservation?.id };
        return this.http.put<Payment>(`${this.apiUrl}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}