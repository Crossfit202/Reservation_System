import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppUserService } from '../../services/app-user.service';
import { AppUser } from '../../Models/app-user.model';
import { Role } from '../../Models/role.model';
import { RoleService } from '../../services/role.service';


type AppUserWithExtras = AppUser & { password?: string, roles?: Role[] };

@Component({
  selector: 'app-app-user',
  templateUrl: './app-user.component.html',
  styleUrls: ['./app-user.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})

export class AppUserComponent implements OnInit {
  users: AppUser[] = [];
  selectedUser: AppUserWithExtras | null = null;
  newUser: AppUserWithExtras = { name: '', email: '', password: '', roles: [] };
  roles: Role[] = [];

  constructor(private userService: AppUserService, private roleService: RoleService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe(data => this.roles = data);
  }

  loadUsers(): void {
    this.userService.getAll().subscribe(data => this.users = data);
  }

  selectUser(user: AppUser): void {
    // Deep copy and ensure roles is an array of Role objects
    this.selectedUser = { ...user, roles: user.roles ? [...user.roles] : [] };
    // Do not copy password for editing
    if ('password' in this.selectedUser) delete (this.selectedUser as any).password;
  }

  createUser(): void {
    // Only send password if set
    const userToSend = { ...this.newUser };
    if (!userToSend.password) delete userToSend.password;
    this.userService.create(userToSend).subscribe(() => {
      this.loadUsers();
      this.newUser = { name: '', email: '', password: '', roles: [] };
    });
  }

  updateUser(): void {
    if (this.selectedUser && this.selectedUser.id) {
      // Do not send password unless explicitly set
      const userToSend = { ...this.selectedUser };
      if (!userToSend.password) delete userToSend.password;
      this.userService.update(this.selectedUser.id, userToSend).subscribe(() => {
        this.loadUsers();
        this.selectedUser = null;
      });
    }
  }

  deleteUser(id: number): void {
    this.userService.delete(id).subscribe(() => this.loadUsers());
  }
}
