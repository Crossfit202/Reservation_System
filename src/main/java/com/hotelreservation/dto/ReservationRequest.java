package com.hotelreservation.dto;

public class ReservationRequest {
    public Long appUserId;
    public Long roomId;
    public String checkIn;
    public String checkOut;
    public int numGuests;
    public String status;

    // Optional payment fields
    public Double paymentAmount;
    public String paymentCurrency;
    public String paymentStatus;
    public String paymentStripePaymentId;
    public Long paymentAppUserId;
}