import { Amenity } from './amenity.model';

export interface Room {
    id?: number;
    roomNumber: string;
    type: string;
    capacity?: number;
    price?: number;
    available?: boolean;
    roomTypeId?: number;
    amenitiesSet?: Amenity[];
    amenityIds?: number[];
}