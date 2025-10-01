import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { Room } from '../../Models/room.model';
import { RoomTypeService } from '../../services/room-type.service';
import { RoomType } from '../../Models/room-type.model';
import { Amenity } from '../../Models/amenity.model';
import { AmenityService } from '../../services/amenity.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RoomComponent implements OnInit {
  rooms: Room[] = [];
  selectedRoom: Room | null = null;
  newRoom: Room = {
    roomNumber: '',
    type: '',
    capacity: 1,
    price: 0,
    available: true,
    roomTypeId: undefined,
    amenityIds: []
  };

  roomTypes: any[] = [];
  amenities: Amenity[] = [];

  constructor(
    private roomService: RoomService,
    private roomTypeService: RoomTypeService,
    private amenityService: AmenityService
  ) { }

  ngOnInit(): void {
    this.loadRooms();
    this.loadRoomTypes();
    this.loadAmenities();
  }

  loadRooms(): void {
    this.roomService.getAll().subscribe(data => this.rooms = data);
  }

  loadRoomTypes(): void {
    this.roomTypeService.getAll().subscribe(data => this.roomTypes = data);
  }

  loadAmenities(): void {
    this.amenityService.getAll().subscribe(data => this.amenities = data);
  }

  selectRoom(room: Room): void {
    this.selectedRoom = { ...room };
  }

  createRoom(): void {
    const roomRequest = {
      roomNumber: this.newRoom.roomNumber,
      type: this.newRoom.type, // <-- Make sure this is set!
      capacity: this.newRoom.capacity,
      price: this.newRoom.price,
      available: this.newRoom.available,
      roomTypeId: this.newRoom.roomTypeId,
      amenityIds: this.newRoom.amenityIds
    };
    this.roomService.create(roomRequest).subscribe(() => {
      this.loadRooms();
      this.newRoom = {
        roomNumber: '',
        type: '',
        capacity: 1,
        price: 0,
        available: true,
        roomTypeId: undefined,
        amenityIds: []
      };
    });
  }

  onEditRoomTypeChange(event: any) {
    const selectedId = event.target.value;
    const selectedType = this.roomTypes.find(rt => rt.id == selectedId);
    if (this.selectedRoom) {
      this.selectedRoom.type = selectedType ? selectedType.name : '';
    }
  }

  updateRoom(): void {
    if (this.selectedRoom && this.selectedRoom.id) {
      const roomRequest = {
        roomNumber: this.selectedRoom.roomNumber,
        type: this.selectedRoom.type,
        capacity: this.selectedRoom.capacity,
        price: this.selectedRoom.price,
        available: this.selectedRoom.available,
        roomTypeId: this.selectedRoom.roomTypeId,
        amenityIds: this.selectedRoom.amenityIds
      };
      this.roomService.update(this.selectedRoom.id, roomRequest).subscribe(() => {
        this.loadRooms();
        this.selectedRoom = null;
      });
    }
  }

  deleteRoom(id: number): void {
    this.roomService.delete(id).subscribe(() => this.loadRooms());
  }

  onRoomTypeChange(event: any) {
    const selectedId = event.target.value;
    const selectedType = this.roomTypes.find(rt => rt.id == selectedId);
    this.newRoom.type = selectedType ? selectedType.name : '';
  }
}
