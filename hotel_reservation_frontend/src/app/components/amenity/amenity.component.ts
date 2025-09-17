import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AmenityService } from '../../services/amenity.service';
import { Amenity } from '../../Models/amenity.model';

@Component({
  selector: 'app-amenity',
  templateUrl: './amenity.component.html',
  styleUrls: ['./amenity.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AmenityComponent implements OnInit {
  amenities: Amenity[] = [];
  selectedAmenity: Amenity | null = null;
  newAmenity: Amenity = { name: '', description: '' };

  constructor(private amenityService: AmenityService) { }

  ngOnInit(): void {
    this.loadAmenities();
  }

  loadAmenities(): void {
    this.amenityService.getAll().subscribe(data => this.amenities = data);
  }

  selectAmenity(amenity: Amenity): void {
    this.selectedAmenity = { ...amenity };
  }

  createAmenity(): void {
    this.amenityService.create(this.newAmenity).subscribe(() => {
      this.loadAmenities();
      this.newAmenity = { name: '', description: '' };
    });
  }

  updateAmenity(): void {
    if (this.selectedAmenity && this.selectedAmenity.id) {
      this.amenityService.update(this.selectedAmenity.id, this.selectedAmenity).subscribe(() => {
        this.loadAmenities();
        this.selectedAmenity = null;
      });
    }
  }

  deleteAmenity(id: number): void {
    this.amenityService.delete(id).subscribe(() => this.loadAmenities());
  }
}
