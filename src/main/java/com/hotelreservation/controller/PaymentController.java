package com.hotelreservation.controller;

import com.hotelreservation.entity.Payment;
import com.hotelreservation.entity.Reservation;
import com.hotelreservation.entity.AppUser;
import com.hotelreservation.repository.ReservationRepository;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.service.PaymentService;
import com.hotelreservation.dto.PaymentRequest;
import com.hotelreservation.dto.PaymentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<PaymentResponse> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        List<PaymentResponse> responses = new java.util.ArrayList<>();
        for (Payment payment : payments) {
            responses.add(toPaymentResponse(payment));
        }
        return responses;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(payment -> ResponseEntity.ok(toPaymentResponse(payment)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody PaymentRequest paymentRequest) {
        Payment payment = new Payment();
        payment.setAmount(paymentRequest.getAmount().doubleValue());
        payment.setCurrency(paymentRequest.getCurrency());
        payment.setStatus("SUCCESSFUL");
        if (paymentRequest.getReservationId() != null) {
            Reservation reservation = reservationRepository.findById(paymentRequest.getReservationId())
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));
            payment.setReservation(reservation);
            // Set appUser from request or fallback to reservation's user
            if (paymentRequest.getAppUserId() != null) {
                AppUser appUser = userRepository.findById(paymentRequest.getAppUserId())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                payment.setAppUser(appUser);
            } else if (reservation.getUser() != null) {
                payment.setAppUser(reservation.getUser());
            }
        }
        // Set stripePaymentId if present
        if (paymentRequest instanceof com.hotelreservation.dto.PaymentRequest) {
            try {
                java.lang.reflect.Method m = paymentRequest.getClass().getMethod("getStripePaymentId");
                Object val = m.invoke(paymentRequest);
                if (val != null)
                    payment.setStripePaymentId(val.toString());
            } catch (Exception ignored) {
            }
        }
        Payment saved = paymentService.createPayment(payment);
        return ResponseEntity.ok(toPaymentResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> updatePayment(@PathVariable Long id,
            @RequestBody PaymentRequest paymentRequest) {
        Payment paymentDetails = new Payment();
        paymentDetails.setAmount(paymentRequest.getAmount().doubleValue());
        paymentDetails.setCurrency(paymentRequest.getCurrency());
        paymentDetails.setStatus(paymentRequest.getCurrency());
        if (paymentRequest.getReservationId() != null) {
            Reservation reservation = reservationRepository.findById(paymentRequest.getReservationId())
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));
            paymentDetails.setReservation(reservation);
        }
        if (paymentRequest.getAppUserId() != null) {
            AppUser appUser = userRepository.findById(paymentRequest.getAppUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            paymentDetails.setAppUser(appUser);
        }
        Payment updated = paymentService.updatePayment(id, paymentDetails);
        return ResponseEntity.ok(toPaymentResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setAmount(java.math.BigDecimal.valueOf(payment.getAmount()));
        response.setCurrency(payment.getCurrency());
        response.setStatus(payment.getStatus());
        response.setCreatedAt(payment.getCreatedAt() != null ? payment.getCreatedAt().toString() : null);
        response.setReservationId(payment.getReservation() != null ? payment.getReservation().getId() : null);
        response.setAppUserId(payment.getAppUser() != null ? payment.getAppUser().getId() : null);
        return response;
    }
}
