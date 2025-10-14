import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../Models/reservation.model';
import { AppUser } from '../../Models/app-user.model';
import { Room } from '../../Models/room.model';
import { AppUserService } from '../../services/app-user.service';
import { RoomService } from '../../services/room.service';

import { AuthService } from '../../services/auth.service';
import { StripeService } from '../../services/stripe.service';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ReservationComponent implements OnInit {
  isAdmin: boolean = false;
  reservations: Reservation[] = [];
  selectedReservation: Reservation | null = null;
  newReservation: Reservation = {
    appUserId: 0,
    roomId: 0,
    checkIn: '',
    checkOut: '',
    numGuests: 1,
    status: '',
    createdAt: '',
    updatedAt: ''
  };
  users: AppUser[] = [];
  rooms: Room[] = [];
  currentUserId: number | null = null;
  public roomIdFromQuery: number | null = null;

  toastMessage: string = '';
  toastTimeout: any;
  errorMessage: string = '';

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: any;
  paymentInProgress = false;
  paymentError = '';
  paymentSuccess = false;

  clientSecret: string = ''; // Add this property to your component

  constructor(
    private reservationService: ReservationService,
    private appUserService: AppUserService,
    private roomService: RoomService,
    private authService: AuthService,
    private stripeService: StripeService,
    private paymentService: PaymentService,
    public route: ActivatedRoute
  ) { }

  get isCurrentUserLoaded(): boolean {
    return this.currentUserId !== null && !!this.users.find((u: AppUser) => u.id === this.currentUserId);
  }
  get currentUserDisplayName(): string {
    if (this.currentUserId !== null) {
      const user = this.users.find((u: AppUser) => u.id === this.currentUserId);
      return user?.name || user?.email || ('User ' + this.currentUserId);
    }
    return '';
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRooms();

    // Get roomId from query params if present
    this.route.queryParams.subscribe(params => {
      const roomId = params['roomId'];
      if (roomId) {
        this.newReservation.roomId = +roomId;
        this.roomIdFromQuery = +roomId;
      }
    });

    // Set isAdmin from AuthService
    this.authService.userRole$.subscribe(role => {
      this.isAdmin = role === 'ADMIN';
    });
  }

  getCurrentUserId(): number | null {
    // Example: extract user ID from JWT (adjust as needed for your AuthService)
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Adjust the key if your JWT uses a different claim for user ID
        return payload.userId || payload.id || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  loadReservations(): void {
    this.reservationService.getAll().subscribe(data => {
      if (this.isAdmin) {
        this.reservations = data;
      } else {
        // Only show reservations for the logged-in user
        this.reservations = data.filter(r => r.appUserId === this.currentUserId);
      }
    });
  }

  loadUsers(): void {
    this.appUserService.getAll().subscribe(data => {
      this.users = data;
      // Always set newReservation.appUserId to the logged-in user's id (by email) for USERs
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const email = payload.email || payload.sub || null;
          if (email) {
            const user = this.users.find((u: AppUser) => u.email === email);
            if (user) {
              this.currentUserId = user.id ?? null;
              this.newReservation.appUserId = user.id;
              if (!this.isAdmin) {
                this.newReservation.status = 'CONFIRMED';
              }
              // Now that we have the user ID, load reservations
              this.loadReservations();
            }
          }
        } catch (e) { /* ignore */ }
      } else {
        // If no token, still load reservations (e.g., for admin)
        this.loadReservations();
      }
    });
  }

  loadRooms(): void {
    this.roomService.getAll().subscribe(data => this.rooms = data);
  }

  selectReservation(reservation: Reservation): void {
    this.selectedReservation = { ...reservation };
  }

  createReservation(): void {
    this.errorMessage = '';
    // Find the selected room's capacity
    const selectedRoom = this.rooms.find(r => r.id === this.newReservation.roomId);
    if (selectedRoom && selectedRoom.capacity !== undefined && this.newReservation.numGuests > selectedRoom.capacity) {
      this.errorMessage = `Cannot reserve for more than ${selectedRoom.capacity} guests in this room.`;
      return;
    }
    this.reservationService.create(this.newReservation).subscribe(() => {
      this.loadReservations();
      this.newReservation = {
        appUserId: 0,
        roomId: 0,
        checkIn: '',
        checkOut: '',
        numGuests: 1,
        status: '',
        createdAt: '',
        updatedAt: ''
      };
      this.showToast('Reservation created successfully!');
    });
  }

  showToast(message: string) {
    this.toastMessage = message;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

  updateReservation(): void {
    if (this.selectedReservation && this.selectedReservation.id) {
      this.reservationService.update(this.selectedReservation.id, this.selectedReservation).subscribe(() => {
        this.loadReservations();
        this.selectedReservation = null;
      });
    }
  }

  deleteReservation(id: number): void {
    this.reservationService.delete(id).subscribe(() => this.loadReservations());
  }

  async showPaymentForm(amount: number, currency: string, description: string) {
    this.paymentInProgress = true;
    this.paymentError = '';
    this.paymentSuccess = false;

    if (!this.stripe) {
      this.stripe = await loadStripe('pk_test_51SHrhqPSQIt22pYjtQQaBCYMso5eGxteHuY74KG09IapD6ur0A1RQgwUcHQxaDCoYWL3fmmCci9as9EuJ6DZJczH00yYGLTAbG');
    }

    this.stripeService.createPaymentIntent(amount, currency, description).subscribe({
      next: async (res) => {
        this.clientSecret = res.clientSecret;
        if (!this.stripe) return;
        if (!this.elements) {
          this.elements = this.stripe.elements();
          this.cardElement = this.elements.create('card');
          this.cardElement.mount('#card-element');
        }
      },
      error: (err) => {
        this.paymentError = err.error?.message || 'Payment failed. Please try another card.';
        this.paymentInProgress = false;
      }
    });
  }

  async confirmPayment(clientSecret: string) {
    this.paymentError = '';
    if (!this.stripe || !this.cardElement) return;
    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: this.cardElement }
      });
      if (result.error) {
        // Show error to user
        this.paymentError = result.error.message || 'Payment failed. Please try another card.';
        this.paymentInProgress = false;
        return;
      }
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        this.paymentSuccess = true;
        this.paymentInProgress = false;
        // Now create the reservation and payment in the backend
        this.createReservationAfterPayment(result.paymentIntent.id, result.paymentIntent.amount, result.paymentIntent.currency, result.paymentIntent.status);
      }
    } catch (err: any) {
      this.paymentError = err.message || 'Payment failed. Please try again.';
      this.paymentInProgress = false;
    }
  }

  createReservationAfterPayment(stripePaymentId: string, amount: number, currency: string, status: string) {
    // 1. Create the reservation
    this.reservationService.create(this.newReservation).subscribe({
      next: reservation => {
        if (reservation.id == null) {
          this.showToast('Reservation creation failed: missing ID.');
          return;
        }
        // 2. Create the payment record
        const payment = {
          reservation: { id: reservation.id },
          amount: amount / 100,
          currency,
          status,
          stripePaymentId
        };
        this.paymentService.create(payment).subscribe({
          next: () => {
            this.loadReservations();
            this.showToast('Reservation and payment successful!');
            // Reset form, etc.
          },
          error: (err) => {
            this.paymentError = err.error?.message || 'Payment record failed. Please contact support.';
          }
        });
      },
      error: (err) => {
        this.paymentError = err.error?.message || 'Reservation creation failed. Please try again.';
      }
    });
  }

  startPaymentProcess(): void {
    this.errorMessage = '';
    const selectedRoom = this.rooms.find(r => r.id === this.newReservation.roomId);
    if (selectedRoom && selectedRoom.capacity !== undefined && this.newReservation.numGuests > selectedRoom.capacity) {
      this.errorMessage = `Cannot reserve for more than ${selectedRoom.capacity} guests in this room.`;
      return;
    }
    const days = this.getReservationDays();
    const pricePerNight = selectedRoom?.price ?? 0;
    const totalPrice = days * pricePerNight;
    const amount = totalPrice * 100;
    const currency = 'usd';
    const description = `Reservation for room ${selectedRoom?.id} for ${days} night(s)`;
    this.showPaymentForm(amount, currency, description);
  }

  getReservationDays(): number {
    if (!this.newReservation.checkIn || !this.newReservation.checkOut) return 0;
    const checkIn = new Date(this.newReservation.checkIn);
    const checkOut = new Date(this.newReservation.checkOut);
    // Hotel logic: nights = checkout - checkin (do not include checkout day)
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 0 ? diffDays : 0;
  }
}
