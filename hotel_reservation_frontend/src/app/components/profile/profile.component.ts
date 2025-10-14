import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppUser } from '../../Models/app-user.model';
import { AppUserService } from '../../services/app-user.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
    user: AppUser | null = null;
    editMode = false;
    password = '';
    confirmPassword = '';
    errorMessage = '';
    successMessage = '';

    constructor(private appUserService: AppUserService, private authService: AuthService) { }

    ngOnInit(): void {
        this.loadUser();
    }

    loadUser(): void {
        const token = localStorage.getItem('jwt');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const email = payload.email || payload.sub || null;
                if (email) {
                    this.appUserService.getAll().subscribe(users => {
                        this.user = users.find(u => u.email === email) || null;
                    });
                }
            } catch (e) { this.user = null; }
        }
    }

    enableEdit(): void {
        this.editMode = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.password = '';
        this.confirmPassword = '';
    }

    cancelEdit(): void {
        this.editMode = false;
        this.loadUser();
    }

    saveChanges(): void {
        if (!this.user) return;
        if (this.password && this.password !== this.confirmPassword) {
            this.errorMessage = 'Passwords do not match.';
            return;
        }
        // Only include password if user entered a new one
        const updatedUser: AppUser = { ...this.user };
        if (this.password) {
            updatedUser.password = this.password;
        } else {
            // Remove password property if not changing
            delete updatedUser.password;
        }
        this.appUserService.update(this.user.id!, updatedUser).subscribe({
            next: () => {
                this.successMessage = 'Profile updated successfully!';
                // Log out the user and redirect to login page
                setTimeout(() => {
                    this.authService.logout();
                    window.location.href = '/login';
                }, 1200); // Show success message briefly before redirect
            },
            error: () => {
                this.errorMessage = 'Failed to update profile.';
            }
        });
    }
}
