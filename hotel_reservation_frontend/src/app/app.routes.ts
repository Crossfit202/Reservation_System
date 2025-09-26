import { Routes } from '@angular/router';
import { AmenityComponent } from './components/amenity/amenity.component';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { AppUserComponent } from './components/app-user/app-user.component';
import { PaymentComponent } from './components/payment/payment.component';
import { ReservationComponent } from './components/reservation/reservation.component';
import { RoomComponent } from './components/room/room.component';
import { RoomTypeComponent } from './components/room-type/room-type.component';
import { RoleComponent } from './components/role/role.component';

export const routes: Routes = [
    { path: '', component: WelcomeScreenComponent },
    { path: 'home', component: WelcomeScreenComponent },
    { path: 'amenities', component: AmenityComponent },
    { path: 'users', component: AppUserComponent },
    { path: 'payments', component: PaymentComponent },
    { path: 'reservations', component: ReservationComponent },
    { path: 'rooms', component: RoomComponent },
    { path: 'room-types', component: RoomTypeComponent },
    { path: 'roles', component: RoleComponent }
];
