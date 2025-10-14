import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../Models/payment.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PaymentComponent implements OnInit {
  payments: Payment[] = [];
  selectedPayment: Payment | null = null;
  newPayment: Payment = {
    reservation: { id: 0 },
    amount: 0,
    currency: '',
    status: '',
    stripePaymentId: '',
    createdAt: ''
  };
  isAdmin: boolean = false;

  constructor(private paymentService: PaymentService, private authService: AuthService) { }

  ngOnInit(): void {
    // Check role from localStorage or a service (adjust as needed)
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roles: string[] = payload.roles || [];
        this.isAdmin = Array.isArray(roles) ? roles.includes('ADMIN') : roles === 'ADMIN';
      } catch (e) {
        this.isAdmin = false;
      }
    }
    this.loadPayments();
  }

  loadPayments(): void {
    this.paymentService.getAll().subscribe(data => this.payments = data);
  }

  selectPayment(payment: Payment): void {
    this.selectedPayment = { ...payment };
  }

  createPayment(): void {
    // Attach appUserId from AuthService
    const userId = this.authService.getUserIdFromJwt();
    if (userId) {
      this.newPayment.appUserId = userId;
    }
    this.paymentService.create(this.newPayment).subscribe(() => {
      this.loadPayments();
      this.newPayment = {
        reservation: { id: 0 },
        amount: 0,
        currency: '',
        status: '',
        stripePaymentId: '',
        createdAt: ''
      };
    });
  }

  updatePayment(): void {
    if (this.selectedPayment && this.selectedPayment.id) {
      this.paymentService.update(this.selectedPayment.id, this.selectedPayment).subscribe(() => {
        this.loadPayments();
        this.selectedPayment = null;
      });
    }
  }

  deletePayment(id: number): void {
    this.paymentService.delete(id).subscribe(() => this.loadPayments());
  }
}
