package com.hotelreservation.controller;

import com.hotelreservation.repository.PaymentRepository;

import com.hotelreservation.entity.AppUser;
import com.hotelreservation.entity.Reservation;
import com.hotelreservation.entity.Room;
import com.hotelreservation.repository.RoomRepository;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.service.ReservationService;
import com.hotelreservation.entity.Payment;
import com.hotelreservation.service.PaymentService;
import com.hotelreservation.dto.ReservationRequest;
import com.hotelreservation.dto.ReservationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private ReservationService reservationService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.hotelreservation.service.StripeService stripeService;

    @GetMapping
    public List<ReservationResponse> getAllReservations() {
        return reservationService.getAllReservations()
                .stream()
                .map(ReservationResponse::new)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable Long id) {
        return reservationService.getReservationById(id)
                .map(reservation -> ResponseEntity.ok(new ReservationResponse(reservation)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ReservationResponse createReservation(@RequestBody ReservationRequest request) {
        Room room = roomRepository.findById(request.roomId).orElseThrow();
        AppUser user = userRepository.findById(request.appUserId).orElseThrow();

        Reservation reservation = new Reservation();
        reservation.setRoom(room);
        reservation.setUser(user);
        reservation.setCheckIn(java.time.LocalDate.parse(request.checkIn));
        reservation.setCheckOut(java.time.LocalDate.parse(request.checkOut));
        reservation.setNumGuests(request.numGuests);
        reservation.setStatus(request.status);

        Reservation savedReservation = reservationService.createReservation(reservation);

        // If payment info is present, create the payment
        if (request.paymentAmount != null && request.paymentCurrency != null) {
            Payment payment = new Payment();
            payment.setAmount(request.paymentAmount);
            payment.setCurrency(request.paymentCurrency);
            payment.setStatus(request.paymentStatus != null ? request.paymentStatus : "SUCCESSFUL");
            payment.setStripePaymentId(request.paymentStripePaymentId);
            payment.setReservation(savedReservation);
            // Set appUser for payment: use paymentAppUserId if provided, else reservation
            // user
            if (request.paymentAppUserId != null) {
                AppUser paymentUser = userRepository.findById(request.paymentAppUserId).orElse(user);
                payment.setAppUser(paymentUser);
            } else {
                payment.setAppUser(user);
            }
            paymentService.createPayment(payment);
        }

        return new ReservationResponse(savedReservation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponse> updateReservation(@PathVariable Long id,
            @RequestBody ReservationRequest request) {
        Room room = roomRepository.findById(request.roomId).orElseThrow();
        AppUser user = userRepository.findById(request.appUserId).orElseThrow();

        Reservation reservation = new Reservation();
        reservation.setRoom(room);
        reservation.setUser(user);
        reservation.setCheckIn(java.time.LocalDate.parse(request.checkIn));
        reservation.setCheckOut(java.time.LocalDate.parse(request.checkOut));
        reservation.setNumGuests(request.numGuests);
        reservation.setStatus(request.status);

        Reservation updatedReservation = reservationService.updateReservation(id, reservation);
        return ResponseEntity.ok(new ReservationResponse(updatedReservation));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancelReservation(@PathVariable Long id) {
        // Find reservation
        Reservation reservation = reservationService.getReservationById(id).orElse(null);
        if (reservation == null) {
            return ResponseEntity.notFound().build();
        }
        reservation.setStatus("CANCELED");
        Reservation updated = reservationService.updateReservation(id, reservation);

        // Update associated payment status to REFUNDED and call Stripe refund
        paymentRepository.findByReservation(reservation).ifPresent(payment -> {
            if (payment.getStripePaymentId() != null && !payment.getStripePaymentId().isEmpty()) {
                try {
                    stripeService.refundPayment(payment.getStripePaymentId(), null);
                    payment.setStatus("REFUNDED");
                } catch (Exception e) {
                    // Optionally log or handle Stripe refund error
                    payment.setStatus("REFUND_FAILED");
                }
            } else {
                // No stripe id, mark as refunded locally if appropriate
                payment.setStatus("REFUNDED");
            }
            paymentService.updatePayment(payment.getId(), payment);
        });

        return ResponseEntity.ok(new ReservationResponse(updated));
    }
}