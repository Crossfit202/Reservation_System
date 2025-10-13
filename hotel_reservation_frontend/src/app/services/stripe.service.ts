import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StripeService {
    private apiUrl = 'http://localhost:8080/api/stripe';

    constructor(private http: HttpClient) { }

    createPaymentIntent(amount: number, currency: string, description: string) {
        return this.http.post<{ clientSecret: string }>(
            `${this.apiUrl}/create-payment-intent`,
            { amount, currency, description }
        );
    }
}