package com.hotelreservation.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String roomNumber;

    @Column(nullable = false)
    private String type;

    private int capacity;
    private double price;

    private boolean available;

    @ManyToOne
    @JoinColumn(name = "room_type_id")
    @JsonIgnoreProperties("rooms")
    private RoomType roomType;

    @ManyToMany
    @JoinTable(name = "room_amenity", joinColumns = @JoinColumn(name = "room_id"), inverseJoinColumns = @JoinColumn(name = "amenity_id"))
    @JsonIgnoreProperties("rooms")
    private java.util.Set<Amenity> amenitiesSet;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public java.util.Set<Amenity> getAmenitiesSet() {
        return amenitiesSet;
    }

    public void setAmenitiesSet(java.util.Set<Amenity> amenitiesSet) {
        this.amenitiesSet = amenitiesSet;
    }
}
