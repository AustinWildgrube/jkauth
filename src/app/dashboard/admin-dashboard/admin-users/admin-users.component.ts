import {Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { UserService } from '../../../shared/services/user.service';
import { AdminUser } from '../../../shared/models/admin-user';
import { AdminService } from '../../../shared/services/admin.service';
import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  allUsers: AdminUser[];

  page: number;
  totalUsers: number;

  constructor(private adminService: AdminService, private userService: UserService) { }

  ngOnInit() {
    this.page = 1;
    this.totalUsers = 0;

    this.getAllUsers();
  }

  public selectUser(userId: number): void {
    this.adminService.setSelectedUserId = userId;
  }

  public banUser(userId: number, userName: string): void {
    Swal.fire({
      title: 'Are you sure you would like to ban ' + userName + '?',
      showCancelButton: true,
      confirmButtonText: 'Use the ban hammer!'
    }).then((result) => {
      if (result.value) {
        this.adminService.banUser(userId).pipe(untilDestroyed(this)).subscribe(
            _ => {
              Swal.fire(
                  'Banned!',
                  'The user was successfully banned.',
                  'success'
              );
            },
            _ => {
              Swal.fire(
                  'There Was An Issue!',
                  'This user has not been banned.',
                  'error'
              );
            }
        );
      }
    });
  }

  private getAllUsers(): void {
   this.userService.getAllUsers().pipe(untilDestroyed(this)).subscribe(response => {
     this.allUsers = response;
     this.totalUsers = this.allUsers.length;
   });
  }
}
