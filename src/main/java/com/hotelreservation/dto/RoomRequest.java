package com.hotelreservation.dto;

import java.util.List;

public class RoomRequest {
    public String roomNumber;
    public String type;
    public Integer capacity;
    public Double price;
    public Boolean available;
    public Long roomTypeId;
    public List<Long> amenityIds;
}