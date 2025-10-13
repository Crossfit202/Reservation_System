package com.hotelreservation.controller;

import com.hotelreservation.entity.Payment;
import com.hotelreservation.entity.Reservation;
import com.hotelreservation.repository.ReservationRepository;
import com.hotelreservation.service.PaymentService;
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
    private ReservationRepository reservationRepository; // Add this

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        // Fetch the Reservation entity by ID if only ID is provided
        if (payment.getReservation() != null && payment.getReservation().getId() != null) {
            Reservation reservation = reservationRepository.findById(payment.getReservation().getId())
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));
            payment.setReservation(reservation);
        }
        return paymentService.createPayment(payment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Long id, @RequestBody Payment paymentDetails) {
        return ResponseEntity.ok(paymentService.updatePayment(id, paymentDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
