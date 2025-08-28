package com.hotelreservation.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hotelreservation.entity.Reservation;
import com.hotelreservation.repository.ReservationRepository;

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
        Reservation existing = reservationRepository.findById(id).orElseThrow();
        existing.setCheckIn(reservationDetails.getCheckIn());
        existing.setCheckOut(reservationDetails.getCheckOut());
        existing.setNumGuests(reservationDetails.getNumGuests());
        existing.setStatus(reservationDetails.getStatus());
        existing.setRoom(reservationDetails.getRoom());
        existing.setUser(reservationDetails.getUser());
        existing.setUpdatedAt(reservationDetails.getUpdatedAt());
        return reservationRepository.save(existing);
    }

    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
}
