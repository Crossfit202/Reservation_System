package com.hotelreservation.service;

import com.hotelreservation.entity.Room;
import com.hotelreservation.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    public Room createRoom(Room room) {
        if (roomRepository.findByRoomNumber(room.getRoomNumber()).isPresent()) {
            throw new IllegalArgumentException("Room with this name already exists.");
        }
        return roomRepository.save(room);
    }

    public Room updateRoom(Long id, Room roomDetails) {
        Room room = roomRepository.findById(id).orElseThrow();
        if (!room.getRoomNumber().equals(roomDetails.getRoomNumber())) {
            if (roomRepository.findByRoomNumber(roomDetails.getRoomNumber()).isPresent()) {
                throw new IllegalArgumentException("Room with this name already exists.");
            }
        }
        room.setRoomNumber(roomDetails.getRoomNumber());
        room.setType(roomDetails.getType());
        room.setCapacity(roomDetails.getCapacity());
        room.setPrice(roomDetails.getPrice());
        room.setAmenitiesSet(roomDetails.getAmenitiesSet());
        room.setAvailable(roomDetails.isAvailable());
        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }
}
