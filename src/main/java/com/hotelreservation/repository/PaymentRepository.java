package com.hotelreservation.repository;

import com.hotelreservation.entity.Reservation;
import java.util.Optional;
import com.hotelreservation.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByReservation(Reservation reservation);
}
