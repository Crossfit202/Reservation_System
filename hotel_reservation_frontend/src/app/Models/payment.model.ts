export interface Payment {
    id?: number;
    reservation: { id: number };
    amount: number;
    currency: string;
    status: string;
    stripePaymentId?: string;
    createdAt?: string; // ISO date string
}