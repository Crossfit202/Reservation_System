import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';
import { Role } from '../../Models/role.model';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RoleComponent implements OnInit {
  roles: Role[] = [];
  selectedRole: Role | null = null;
  newRole: Role = { name: '' };

  constructor(private roleService: RoleService) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe(data => this.roles = data);
  }

  selectRole(role: Role): void {
    this.selectedRole = { ...role };
  }

  createRole(): void {
    this.roleService.create(this.newRole).subscribe(() => {
      this.loadRoles();
      this.newRole = { name: '' };
    });
  }

  updateRole(): void {
    if (this.selectedRole && this.selectedRole.id) {
      this.roleService.update(this.selectedRole.id, this.selectedRole).subscribe(() => {
        this.loadRoles();
        this.selectedRole = null;
      });
    }
  }

  deleteRole(id: number): void {
    this.roleService.delete(id).subscribe(() => this.loadRoles());
  }
}
