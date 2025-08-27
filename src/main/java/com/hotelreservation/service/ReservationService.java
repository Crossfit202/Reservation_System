package com.hotelreservation.service;

import com.hotelreservation.entity.Reservation;
import com.hotelreservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {
    @Autowired
    private ReservationRepository reservationRepository;

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }

    public Reservation createReservation(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    public Reservation updateReservation(Long id, Reservation reservationDetails) {
        Reservation reservation = reservationRepository.findById(id).orElseThrow();
        reservation.setCheckIn(reservationDetails.getCheckIn());
        reservation.setCheckOut(reservationDetails.getCheckOut());
        reservation.setNumGuests(reservationDetails.getNumGuests());
        reservation.setStatus(reservationDetails.getStatus());
        reservation.setRoom(reservationDetails.getRoom());
        reservation.setUser(reservationDetails.getUser());
        reservation.setCreatedAt(reservationDetails.getCreatedAt());
        reservation.setUpdatedAt(reservationDetails.getUpdatedAt());
        return reservationRepository.save(reservation);
    }

    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
}
