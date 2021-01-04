import { Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map, mergeMap, tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

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
  isLoaded: boolean;

  constructor(private adminService: AdminService, private scriptService: ScriptService) { }

  ngOnInit(): void {
    this.currentScript = this.scriptService.getCurrentScript;
    this.scriptPayments = [];
    this.scriptPaymentsPage = 0;
    this.isLoaded = false;

    this.getSales();
  }

  private getSales(): void {
    let salesList = [];

    this.adminService.getDeveloperSales(this.currentScript).pipe(untilDestroyed(this)).pipe(
        tap(sales => {
          salesList = [...sales[1]['payments'], ...sales[0]['payments']];
          salesList.sort((a, b) => {
            return Date.parse(b.last_update) - Date.parse(a.last_update);
          });
        }),
        mergeMap(() => forkJoin(
            salesList.map(sale =>
                this.adminService.getUserDetails(sale.user_id).pipe(
                    map(response =>
                        ({...sale, username: response[0] ? response[0].name : ''})
                    )
                )
            )
        ))
    ).subscribe(response => {
      this.scriptPayments = response;
      this.isLoaded = true;
    });
  }
}
