import { Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

import { User } from '../../models/user';

@UntilDestroy()
@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
})
export class DashboardHeaderComponent implements OnInit {
  userDetails: User;

  username: string;
  account: boolean;
  dashboard: boolean;
  mobileMenu: boolean;
  isUser: boolean;

  constructor(private authService: AuthService, private userService: UserService) { }

  ngOnInit() {
    this.account = false;
    this.dashboard = false;
    this.isUser = true;

    if (this.authService.userValue != null) {
      this.userDetails = this.authService.userValue;
      this.getOwnDetails();

      for (const role of this.userDetails.role) {
        if (role !== 'user') {
          this.isUser = false;
        }
      }
    }
  }

  public toggleMobileMenu(): void {
    this.mobileMenu = !this.mobileMenu;
  }

  public logout(): void {
    this.authService.logout();
  }

  private getOwnDetails(): void {
    this.userService.getSelf().pipe(untilDestroyed(this)).subscribe(response => {
      this.username = response.name;
    });
  }
}
