import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppUserService } from '../../services/app-user.service';
import { AppUser } from '../../Models/app-user.model';

@Component({
  selector: 'app-app-user',
  templateUrl: './app-user.component.html',
  styleUrls: ['./app-user.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AppUserComponent implements OnInit {
  users: AppUser[] = [];
  selectedUser: AppUser | null = null;
  newUser: AppUser = { username: '', email: '' };

  constructor(private userService: AppUserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe(data => this.users = data);
  }

  selectUser(user: AppUser): void {
    this.selectedUser = { ...user };
  }

  createUser(): void {
    this.userService.create(this.newUser).subscribe(() => {
      this.loadUsers();
      this.newUser = { username: '', email: '' };
    });
  }

  updateUser(): void {
    if (this.selectedUser && this.selectedUser.id) {
      this.userService.update(this.selectedUser.id, this.selectedUser).subscribe(() => {
        this.loadUsers();
        this.selectedUser = null;
      });
    }
  }

  deleteUser(id: number): void {
    this.userService.delete(id).subscribe(() => this.loadUsers());
  }
}
