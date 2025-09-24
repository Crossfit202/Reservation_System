package com.hotelreservation.dto;

public class ReservationRequest {
    public Long appUserId;
    public Long roomId;
    public String checkIn;
    public String checkOut;
    public int numGuests;
    public String status;
}