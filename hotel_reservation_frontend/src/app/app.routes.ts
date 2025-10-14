import { Routes } from '@angular/router';
import { AmenityComponent } from './components/amenity/amenity.component';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { AppUserComponent } from './components/app-user/app-user.component';
import { PaymentComponent } from './components/payment/payment.component';
import { ReservationComponent } from './components/reservation/reservation.component';
import { RoomComponent } from './components/room/room.component';
import { RoomTypeComponent } from './components/room-type/room-type.component';
import { RoleComponent } from './components/role/role.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: '', component: WelcomeScreenComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    { path: 'rooms', component: RoomComponent, canActivate: [AuthGuard] },
    { path: 'reservations', component: ReservationComponent, canActivate: [AuthGuard] },
    { path: 'amenities', component: AmenityComponent, canActivate: [AuthGuard] },
    { path: 'users', component: AppUserComponent, canActivate: [AuthGuard] },
    { path: 'payments', component: PaymentComponent, canActivate: [AuthGuard] },
    { path: 'room-types', component: RoomTypeComponent, canActivate: [AuthGuard] },
    { path: 'roles', component: RoleComponent, canActivate: [AuthGuard] },
    {
        path: 'profile',
        canActivate: [AuthGuard],
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
    },
];
