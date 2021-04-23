import { Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map, mergeMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { UserService } from '../../shared/services/user.service';
import { ScriptService } from '../../shared/services/script.service';

import { Auths } from '../../shared/models/auths';
import { AdminUser } from '../../shared/models/admin-user';
import { UserPayments } from '../../shared/models/user-payments';

import Swal from 'sweetalert2';
import { Base64 } from 'js-base64';

@UntilDestroy()
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  auths: Auths[];
  purchases: UserPayments[];
  userDetails: AdminUser;

  currentDate: string;
  username: string;
  keysPage: number;
  purchasesPage: number;

  setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };

  constructor(private userService: UserService, private scriptService: ScriptService) { }

  ngOnInit() {
    this.keysPage = 0;
    this.purchasesPage = 0;

    this.currentDate = new Date().toISOString().replace('Z', '')
        .replace('T', ' ');

    this.getSelfDetails();
    this.getSelfPurchases();
    this.getSelfAuths();
  }

  public getKeyFile(): void {
    this.userService.getKeygenFile().pipe(untilDestroyed(this)).subscribe(
      response => {
        this.dyanmicDownloadByHtmlTag({
          fileName: 'jk_auth.key',
          text: Base64.decode(response)
        }
      );
    },
    error => {
      if (error.status === 412) {
        Swal.fire({
          title: 'You must set your Hanbot ID first!',
          html: 'You can do this by clicking the account button and then clicking the menu option \'Hanbot ID\'',
          showConfirmButton: true,
          icon: 'error'
        });
      }
    });
  }

  private getSelfDetails(): void {
    this.userService.getSelf().pipe(untilDestroyed(this)).subscribe(response => {
      this.username = response.name;
      this.userDetails = response;
    });
  }

  private getSelfPurchases(): void {
    this.userService.getSelfPurchases().pipe(untilDestroyed(this)).pipe(
      mergeMap(purchases => forkJoin(
        purchases.map(purchase =>
          this.scriptService.getScriptDetails(purchase.script_id).pipe(
            map(responseTwo =>
              ({...purchase, sname: responseTwo[0] ? responseTwo[0].sname : ''})
            )
          )
        )
      ))
    ).subscribe(
      (purchasesWithName: UserPayments[]) => this.purchases = purchasesWithName
    );
  }

  private getSelfAuths(): void {
    this.userService.getSelfAuths().pipe(untilDestroyed(this)).subscribe(response => {
      this.auths = response;
    });
  }

  private dyanmicDownloadByHtmlTag(arg: { fileName: string, text: string }): void {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    const element = this.setting.element.dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);

    const event = new MouseEvent('click');
    element.dispatchEvent(event);
  }
}
