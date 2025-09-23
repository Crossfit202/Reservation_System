export interface Payment {
    id?: number;
    reservationId: number;
    amount: number;
    currency: string;
    status: string;
    stripePaymentId?: string;
    createdAt?: string; // ISO date string
}