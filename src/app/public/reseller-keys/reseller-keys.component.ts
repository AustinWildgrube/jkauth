import { Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ResellerService } from '../../shared/services/reseller.service';
import { ScriptService } from '../../shared/services/script.service';
import { AdminUser } from '../../shared/models/admin-user';
import { UserService } from '../../shared/services/user.service';
import { AdminService} from '../../shared/services/admin.service';

import { Script } from '../../shared/models/script';

@UntilDestroy()
@Component({
  selector: 'app-reseller-keys',
  templateUrl: './reseller-keys.component.html',
})
export class ResellerKeysComponent implements OnInit {
  scriptsWithKeys: Array<number>;
  resellerKeys: Array<object>;
  scriptDetails: Script[];

  userDetails: AdminUser;
  username: string;

  selectedScript: number;

  constructor(private resellerService: ResellerService, private scriptService: ScriptService,
              private userService: UserService, private adminService: AdminService) { }

  ngOnInit(): void {
    this.scriptsWithKeys = [];
    this.resellerKeys = [];
    this.scriptDetails = [];

    this.selectedScript = null;

    this.getResellerKeys();
    this.getSelfDetails();
  }

  private getSelfDetails(): void {
    this.userService.getSelf().pipe(untilDestroyed(this)).subscribe(response => {
      this.username = response.name;
      this.userDetails = response;
    });
  }

  private getResellerKeys(): void {
    this.resellerService.getResellerKeys().pipe(untilDestroyed(this)).subscribe(response => {
      this.resellerKeys = response;

      this.resellerKeys.forEach( (element) => {
        if (!this.scriptsWithKeys.includes(element['script_id'])) {
          this.scriptsWithKeys.push(element['script_id']);
        }
      });

      this.getScriptDetails();
    });
  }

  private getScriptDetails(): void {
    this.scriptsWithKeys.forEach(response => {
      this.scriptService.getScriptDetails(response).pipe(untilDestroyed(this)).subscribe(responseTwo => {
        this.adminService.getUserDetails(responseTwo[0].author).pipe(untilDestroyed(this)).subscribe(responseThree => {
          if (responseThree[0].name !== 'Dalenka') {
            responseTwo[0].author = responseThree[0].name;
          } else {
            responseTwo[0].author = 'MrImpressive';
          }
          this.scriptDetails.push(responseTwo[0]);
        });
      });
    });
  }
}
