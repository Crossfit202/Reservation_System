package com.hotelreservation.controller;

import com.hotelreservation.dto.RoomRequest;
import com.hotelreservation.entity.Amenity;
import com.hotelreservation.entity.Room;
import com.hotelreservation.repository.AmenityRepository;
import com.hotelreservation.service.RoomService;
import com.hotelreservation.repository.RoomTypeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashSet;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired
    private RoomService roomService;

    @Autowired
    private AmenityRepository amenityRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return roomService.getRoomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Room createRoom(@RequestBody RoomRequest request) {
        Room room = new Room();
        room.setRoomNumber(request.roomNumber);
        room.setType(request.type);
        room.setCapacity(request.capacity);
        room.setPrice(request.price);
        room.setAvailable(request.available);

        if (request.roomTypeId != null) {
            room.setRoomType(roomTypeRepository.findById(request.roomTypeId).orElse(null));
        }

        if (request.amenityIds != null) {
            List<Amenity> amenities = amenityRepository.findAllById(request.amenityIds);
            room.setAmenitiesSet(new HashSet<>(amenities));
        }

        return roomService.createRoom(room);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody RoomRequest request) {
        Room roomDetails = new Room();
        roomDetails.setRoomNumber(request.roomNumber);
        roomDetails.setType(request.type);
        roomDetails.setCapacity(request.capacity);
        roomDetails.setPrice(request.price);
        roomDetails.setAvailable(request.available);

        if (request.roomTypeId != null) {
            roomDetails.setRoomType(roomTypeRepository.findById(request.roomTypeId).orElse(null));
        }

        if (request.amenityIds != null) {
            List<Amenity> amenities = amenityRepository.findAllById(request.amenityIds);
            roomDetails.setAmenitiesSet(new HashSet<>(amenities));
        }

        return ResponseEntity.ok(roomService.updateRoom(id, roomDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
