package com.hotelreservation.dto;

import com.hotelreservation.entity.Reservation;

public class ReservationResponse {
    public Long id;
    public String checkIn;
    public String checkOut;
    public int numGuests;
    public String status;
    public String createdAt;
    public String updatedAt;
    public Long appUserId;
    public String appUserName;
    public String appUserEmail;
    public Long roomId;
    public String roomNumber;
    public String roomType;
    // Add other fields as needed

    public ReservationResponse(Reservation reservation) {
        this.id = reservation.getId();
        this.checkIn = reservation.getCheckIn().toString();
        this.checkOut = reservation.getCheckOut().toString();
        this.numGuests = reservation.getNumGuests();
        this.status = reservation.getStatus();
        this.createdAt = reservation.getCreatedAt().toString();
        this.updatedAt = reservation.getUpdatedAt().toString();
        this.appUserId = reservation.getUser().getId();
        this.appUserName = reservation.getUser().getName();
        this.appUserEmail = reservation.getUser().getEmail();
        this.roomId = reservation.getRoom().getId();
        this.roomNumber = reservation.getRoom().getRoomNumber();
        this.roomType = reservation.getRoom().getType();
    }
}