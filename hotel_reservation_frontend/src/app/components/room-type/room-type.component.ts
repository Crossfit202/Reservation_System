import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomTypeService } from '../../services/room-type.service';
import { RoomType } from '../../Models/room-type.model';

@Component({
  selector: 'app-room-type',
  templateUrl: './room-type.component.html',
  styleUrls: ['./room-type.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RoomTypeComponent implements OnInit {
  roomTypes: RoomType[] = [];
  selectedRoomType: RoomType | null = null;
  newRoomType: RoomType = { name: '', description: '' };

  constructor(private roomTypeService: RoomTypeService) {}

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  loadRoomTypes(): void {
    this.roomTypeService.getAll().subscribe(data => this.roomTypes = data);
  }

  selectRoomType(roomType: RoomType): void {
    this.selectedRoomType = { ...roomType };
  }

  createRoomType(): void {
    this.roomTypeService.create(this.newRoomType).subscribe(() => {
      this.loadRoomTypes();
      this.newRoomType = { name: '', description: '' };
    });
  }

  updateRoomType(): void {
    if (this.selectedRoomType && this.selectedRoomType.id) {
      this.roomTypeService.update(this.selectedRoomType.id, this.selectedRoomType).subscribe(() => {
        this.loadRoomTypes();
        this.selectedRoomType = null;
      });
    }
  }

  deleteRoomType(id: number): void {
    this.roomTypeService.delete(id).subscribe(() => this.loadRoomTypes());
  }
}
