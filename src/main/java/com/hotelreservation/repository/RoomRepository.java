package com.hotelreservation.repository;

import com.hotelreservation.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByAvailable(boolean available);

    Optional<Room> findByRoomNumber(String roomNumber);
}
