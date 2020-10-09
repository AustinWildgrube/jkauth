import { Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { UserPayments } from '../../../../shared/models/user-payments';
import { AdminService } from '../../../../shared/services/admin.service';
import { ScriptService } from '../../../../shared/services/script.service';

@UntilDestroy()
@Component({
  selector: 'app-dev-scripts-sales',
  templateUrl: './dev-scripts-sales.component.html',
})
export class DevScriptsSalesComponent implements OnInit {
  scriptPayments: UserPayments[];

  scriptPaymentsPage: number;
  currentScript: number;
  username: string;
  searchTerm: string;

  constructor(private adminService: AdminService, private scriptService: ScriptService) { }

  ngOnInit(): void {
    this.currentScript = this.scriptService.getCurrentScript;
    this.scriptPayments = [];
    this.scriptPaymentsPage = 0;

    this.getSales();
  }

  private getSales(): void {
    this.adminService.getDeveloperSales(this.currentScript).pipe(untilDestroyed(this)).subscribe(response => {
      this.scriptPayments = response[1]['payments'];

      this.scriptPayments.forEach((responsetwo, index) => {
        this.adminService.getUserDetails(responsetwo.user_id).pipe(untilDestroyed(this)).subscribe(responseThree => {
          this.scriptPayments[index].username = responseThree[0].name;
        });
      });
    });
  }
}
