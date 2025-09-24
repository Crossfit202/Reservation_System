export interface Reservation {
    id?: number;
    appUserId?: number;
    appUserName?: string;
    appUserEmail?: string;
    roomId?: number;
    roomNumber?: string;
    roomType?: string;
    checkIn: string;
    checkOut: string;
    numGuests: number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}