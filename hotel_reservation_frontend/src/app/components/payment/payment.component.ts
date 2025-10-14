import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../Models/payment.model';
import { AuthService } from '../../services/auth.service';
import { UserService, AppUser } from '../../services/user.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PaymentComponent implements OnInit {
  userEmail: string | null = null;
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
  currentUserId: number | null = null;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Check role and user email from JWT
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT payload:', payload); // DEBUG: print the full payload
        const roles: string[] = payload.roles || [];
        this.isAdmin = Array.isArray(roles) ? roles.includes('ADMIN') : roles === 'ADMIN';
        this.userEmail = payload.sub || null;
      } catch (e) {
        this.isAdmin = false;
        this.userEmail = null;
      }
    } else {
      this.userEmail = null;
    }
    // If not admin, fetch user ID by email using UserService
    if (!this.isAdmin && this.userEmail) {
      this.userService.getUserByEmail(this.userEmail).subscribe(users => {
        if (Array.isArray(users) && users.length > 0) {
          this.currentUserId = users[0].id;
        } else if (users && (users as any).id) {
          this.currentUserId = (users as any).id;
        } else {
          this.currentUserId = null;
        }
        this.loadPayments();
      }, () => {
        this.currentUserId = null;
        this.loadPayments();
      });
    } else {
      this.loadPayments();
    }

  }

  loadPayments(): void {
    this.paymentService.getAll().subscribe(data => {
      console.log('Loaded payments:', data);
      console.log('Current user ID:', this.currentUserId);
      if (this.isAdmin) {
        this.payments = data;
      } else if (this.currentUserId) {
        // Ensure both sides are numbers for comparison
        this.payments = data.filter(payment => Number(payment.appUserId) === Number(this.currentUserId));
      } else {
        this.payments = [];
      }
    });
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
