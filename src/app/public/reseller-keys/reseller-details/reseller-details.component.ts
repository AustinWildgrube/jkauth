import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { UserService } from '../../../shared/services/user.service';
import { ResellerService } from '../../../shared/services/reseller.service';
import { AdminService } from '../../../shared/services/admin.service';
import { ScriptService } from '../../../shared/services/script.service';

import { Script } from '../../../shared/models/script';
import { ResellerKeys } from '../../../shared/models/reseller-keys';

@UntilDestroy()
@Component({
  selector: 'app-reseller-details',
  templateUrl: './reseller-details.component.html',
})
export class ResellerDetailsComponent implements OnInit {
  filteredSoldResellerKeys: ResellerKeys[];
  filteredUnsoldResellerKeys: ResellerKeys[];
  resellerKeys: ResellerKeys[];
  scriptDetails: Script;

  username: string;
  page: number;
  pageTwo: number;
  unsoldKeyCount: number;
  soldKeyCount: number;
  selectedScriptId: number;

  constructor(private activatedRoute: ActivatedRoute, private userService: UserService,
              private resellerService: ResellerService, private adminService: AdminService,
              private scriptService: ScriptService) { }

  ngOnInit(): void {
    this.filteredUnsoldResellerKeys = [];
    this.filteredSoldResellerKeys = [];

    this.unsoldKeyCount = 0;
    this.soldKeyCount = 0;

    this.activatedRoute.queryParams.pipe(untilDestroyed(this)).subscribe(params => {
      this.selectedScriptId = +params['script-id'];
    });

    this.getScriptDetails(this.selectedScriptId);
    this.getResellerKeys();
  }

  private getScriptDetails(scriptId: number): void {
    this.scriptService.getScriptDetails(scriptId).pipe(untilDestroyed(this)).subscribe(response => {
      this.scriptDetails = response[0];

      this.adminService.getUserDetails(this.scriptDetails.author).pipe(untilDestroyed(this)).subscribe(
      responseTwo => {
        if (responseTwo[0].name === 'Dalenka') {
          this.scriptDetails.name = 'MrImpressive';
        } else {
          this.scriptDetails.name = responseTwo[0].name;
        }
      });
    });
  }

  private getResellerKeys(): void {
    this.resellerService.getResellerKeys().pipe(untilDestroyed(this)).subscribe(response => {
      this.resellerKeys = response;

      this.resellerKeys.forEach(key => {
        if (key['script_id'] === this.selectedScriptId) {
          if (key['redeemed_by'] === -1) {
            this.filteredUnsoldResellerKeys.push(key);
            this.unsoldKeyCount++;
          } else {
            this.adminService.getUserDetails(key['redeemed_by']).pipe(untilDestroyed(this)).subscribe(
            responseTwo => {
              key['redeemed_by_name'] = responseTwo[0]['name'];
              this.filteredSoldResellerKeys.push(key);
              this.soldKeyCount++;
            });
          }
        }
      });
    });
  }
}
