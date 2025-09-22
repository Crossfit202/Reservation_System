import { Routes } from '@angular/router';
import { AmenityComponent } from './components/amenity/amenity.component';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { AppUserComponent } from './components/app-user/app-user.component';

export const routes: Routes = [
    { path: '', component: WelcomeScreenComponent },
    { path: 'amenities', component: AmenityComponent },
    { path: 'users', component: AppUserComponent }
];
