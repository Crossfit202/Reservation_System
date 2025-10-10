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

  constructor(
    private reservationService: ReservationService,
    private appUserService: AppUserService,
    private roomService: RoomService,
    private authService: AuthService,
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
    this.loadReservations();
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

    // Get current user ID (assumes AuthService provides it via JWT or similar)
    const userId = this.getCurrentUserId();
    if (userId) {
      this.newReservation.appUserId = userId;
      this.currentUserId = userId;
    }

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
            }
          }
        } catch (e) { /* ignore */ }
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
}
