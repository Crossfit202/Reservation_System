import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../Models/reservation.model';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ReservationComponent implements OnInit {
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

  constructor(private reservationService: ReservationService) { }

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getAll().subscribe(data => this.reservations = data);
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
    });
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
