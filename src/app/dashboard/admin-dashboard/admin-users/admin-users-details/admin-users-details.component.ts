import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AdminService } from '../../../../shared/services/admin.service';
import { UserService } from '../../../../shared/services/user.service';
import { ScriptService } from '../../../../shared/services/script.service';

import { Hwid } from '../../../../shared/models/hwid';
import { Script } from '../../../../shared/models/script';
import { AdminUser } from '../../../../shared/models/admin-user';
import { UserPayments } from '../../../../shared/models/user-payments';

import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-admin-users-details',
  templateUrl: './admin-users-details.component.html',
})
export class AdminUsersDetailsComponent implements OnInit {
  userPaymentsList: UserPayments[];
  userHwidList: Hwid[];
  userScriptsList: Script[];
  userInfo: AdminUser;

  userPaymentsListLength: number;
  totalUsedSpent: number;
  selectedUserId: number;
  userPaymentsPage: number;
  userHwidsPage: number;
  userScriptsPage: number;
  userId: number;

  constructor(private activatedRouter: ActivatedRoute, private adminService: AdminService, private userService: UserService,
              private scriptService: ScriptService) { }

  ngOnInit() {
    this.selectedUserId = this.adminService.getSelectedUserId;
    this.userPaymentsListLength = 0;
    this.userPaymentsPage = 0;
    this.userHwidsPage = 0;
    this.userScriptsPage = 0;

    this.activatedRouter.queryParams.pipe(untilDestroyed(this)).subscribe(response => {
      this.userId = response['user_id'];
    });

    if (!this.selectedUserId) {
      this.selectedUserId = this.userId;
    }

    this.getUserPayments(this.selectedUserId);
    this.getUserHwid(this.selectedUserId);
    this.getUserDetails(this.selectedUserId);
  }

  public disableUser(userId: number, username: string): void {
    Swal.fire({
      title: 'Are you sure you would like to disable ' + username + '?',
      showCancelButton: true,
      confirmButtonText: 'Yes!'
    }).then((result) => {
      if (result.value) {
        this.adminService.disableUser(userId).pipe(untilDestroyed(this)).subscribe(
            _ => {
              Swal.fire(
                  'Disabled!',
                  'The user was successfully disabled.',
                  'success'
              );

              this.getUserDetails(this.userId);
            },
            _ => {
              Swal.fire(
                  'There Was An Issue!',
                  'This user has not been disabled.',
                  'error'
              );
            }
        );
      }
    });
  }

  public banUser(userId: number, username: string): void {
    Swal.fire({
      title: 'Are you sure you would like to ban ' + username + '?',
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

            this.getUserDetails(this.userId);
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

  public promoteUser(userId: number, username: string, rank: string): void {
    Swal.fire({
      title: 'Are you sure you would like to promote ' + username + ' to ' + rank + '?',
      showCancelButton: true,
      confirmButtonText: 'Yes!'
    }).then((result) => {
      if (result.value) {
        this.adminService.promoteUser(userId, rank).pipe(untilDestroyed(this)).subscribe(
            _ => {
              Swal.fire(
                  'Promoted!',
                  'The user was successfully promoted to ' + rank,
                  'success'
              );

              this.getUserDetails(this.userId);
            },
            _ => {
              Swal.fire(
                  'There Was An Issue!',
                  'This user has not been promoted.',
                  'error'
              );
            }
        );
      }
    });
  }

  private getUserPayments(userId: number): void {
    this.adminService.getUserPurchases(userId).pipe(untilDestroyed(this)).subscribe(response => {
      this.userPaymentsList = response;

      for (const paymentLength of this.userPaymentsList) {
        if (paymentLength.current_status === 'COMPLETED') {
          this.userPaymentsListLength++;
        }
      }

      this.totalUsedSpent = 0;
      for (const payment of this.userPaymentsList) {
        if (payment.current_status === 'COMPLETED') {
          this.totalUsedSpent += payment['euro'];
        }
      }
    });
  }

  private getUserHwid(userId: number): void {
    this.adminService.getUserHwid(userId).pipe(untilDestroyed(this)).subscribe(response => {
      this.userHwidList = response.sort((n1, n2) => n1.script_id - n2.script_id);

      this.userHwidList.forEach(responseTwo => {
        this.scriptService.getScriptDetails(responseTwo.script_id).subscribe(responseThree => {
          responseTwo.sname = responseThree[0].sname;
        });
      });
    });
  }

  private getUserDetails(userId: number): void {
    this.adminService.getUserDetails(userId).pipe(untilDestroyed(this)).subscribe(response => {
      this.userInfo = response[0];

      if (this.userInfo && (this.userInfo.is_developer || this.userInfo.is_admin)) {
        this.getUserScripts(this.selectedUserId);
      }
    });
  }

  private getUserScripts(userid: number): void {
    this.userService.getScripts(userid).pipe(untilDestroyed(this)).subscribe(response => {
      this.userScriptsList = response;
    });
  }
}
