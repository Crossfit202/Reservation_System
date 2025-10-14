import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
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
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule]
})
export class ReservationComponent implements OnInit {
  showCancelModal: boolean = false;
  pendingCancelReservationId: number | null = null;
  openCancelModal(reservationId?: number): void {
    if (!reservationId) return;
    this.pendingCancelReservationId = reservationId;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.pendingCancelReservationId = null;
  }

  confirmCancelReservation(): void {
    if (!this.pendingCancelReservationId) return;
    this.cancelReservation(this.pendingCancelReservationId);
    this.closeCancelModal();
  }
  canCancel(reservation: Reservation): boolean {
    if (!reservation.checkIn) return false;
    const checkInDate = new Date(reservation.checkIn);
    const today = new Date();
    // 7 days = 604800000 ms
    return (checkInDate.getTime() - today.getTime()) > 7 * 24 * 60 * 60 * 1000;
  }

  cancelReservation(reservationId?: number): void {
    if (!reservationId) return;
    this.reservationService.cancelReservation(reservationId).subscribe(() => {
      this.loadReservations();
      this.showToast('Reservation cancelled.');
    });
  }
  allReservations = [] as Array<Reservation>;
  // Disable reserved dates in the datepicker
  dateFilter = (date: Date | null): boolean => {
    if (!date) return true;
    // Compare only date part (ignore time)
    const dStr = date.toISOString().split('T')[0];
    return !this.reservedDates.some(rd => rd.toISOString().split('T')[0] === dStr);
  };
  // Returns today in yyyy-mm-dd format
  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Returns 1 year from today in yyyy-mm-dd format
  getMaxDate(): string {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  }

  // Note: To fully block out reserved dates, a custom date picker is needed. The reservedDates array is available for integration.
  reservedDates: Date[] = [];
  upcomingReservations: Reservation[] = [];
  pastReservations: Reservation[] = [];
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
      this.allReservations = data;
      let filtered: Reservation[];
      if (this.isAdmin) {
        filtered = data;
      } else {
        // Only show reservations for the logged-in user
        filtered = data.filter(r => r.appUserId === this.currentUserId);
      }
      this.reservations = filtered;
      this.splitReservationsByDate();
      this.updateReservedDates();
    });
  }

  updateReservedDates(): void {
    // Only if a room is selected
    if (!this.newReservation.roomId) {
      this.reservedDates = [];
      return;
    }
    // Use all reservations for the selected room (not just current user's)
    const allRoomReservations = this.allReservations.filter(r => r.roomId === this.newReservation.roomId);
    const reserved: Date[] = [];
    for (const res of allRoomReservations) {
      if (res.checkIn && res.checkOut) {
        const start = new Date(res.checkIn);
        const end = new Date(res.checkOut);
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          reserved.push(new Date(d));
        }
      }
    }
    this.reservedDates = reserved;
  }

  splitReservationsByDate(): void {
    const now = new Date();
    this.upcomingReservations = [];
    this.pastReservations = [];
    for (const reservation of this.reservations) {
      // Move canceled reservations to past
      if (reservation.status === 'CANCELED') {
        this.pastReservations.push(reservation);
        continue;
      }
      if (reservation.checkOut) {
        const checkOutDate = new Date(reservation.checkOut);
        if (checkOutDate >= now) {
          this.upcomingReservations.push(reservation);
        } else {
          this.pastReservations.push(reservation);
        }
      } else {
        this.upcomingReservations.push(reservation);
      }
    }
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
    this.updateReservedDates();
    // Format dates as yyyy-MM-dd
    const formatDate = (d: any) => {
      if (!d) return '';
      if (typeof d === 'string' && d.length === 10 && d.match(/^\d{4}-\d{2}-\d{2}$/)) return d;
      const date = new Date(d);
      return date.toISOString().slice(0, 10);
    };
    const reservationToSend = {
      ...this.newReservation,
      checkIn: formatDate(this.newReservation.checkIn),
      checkOut: formatDate(this.newReservation.checkOut)
    };
    this.reservationService.create(reservationToSend).subscribe(() => {
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
        console.log('Stripe paymentIntent.id:', result.paymentIntent.id);
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
    const formatDate = (d: any) => {
      if (!d) return '';
      if (typeof d === 'string' && d.length === 10 && d.match(/^[\d]{4}-[\d]{2}-[\d]{2}$/)) return d;
      const date = new Date(d);
      return date.toISOString().slice(0, 10);
    };
    const reservationToSend = {
      ...this.newReservation,
      checkIn: formatDate(this.newReservation.checkIn),
      checkOut: formatDate(this.newReservation.checkOut)
    };
    this.reservationService.create(reservationToSend).subscribe({
      next: reservation => {
        if (reservation.id == null) {
          this.showToast('Reservation creation failed: missing ID.');
          return;
        }
        // 2. Create the payment record
        const payment = {
          reservation: { id: reservation.id },
          amount: amount / 100,
          currency: currency,
          status: status,
          stripePaymentId: stripePaymentId
        };
        console.log('Payment object sent to backend:', payment);
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
    this.updateReservedDates();
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
