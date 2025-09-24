export interface AppUser {
    id?: number;
    email: string;
    name?: string; // Add this line
    roles?: any[];
}