export interface Reservation {
    id?: number;
    appUserId: number;
    roomId: number;
    checkIn: string;      // ISO date string (e.g., '2024-09-22')
    checkOut: string;     // ISO date string
    numGuests: number;
    status: string;
    createdAt?: string;   // ISO date string
    updatedAt?: string;   // ISO date string
}