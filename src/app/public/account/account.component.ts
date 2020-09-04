import { Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { UserService } from '../../shared/services/user.service';

import { Auths } from '../../shared/models/auths';
import { AdminUser } from '../../shared/models/admin-user';
import { UserPayments } from '../../shared/models/user-payments';

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
  keygenIsGenerating: boolean;

  setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.currentDate = new Date().toISOString();
    this.keygenIsGenerating = false;

    this.getSelfDetails();
    this.getSelfPurchases();
    this.getSelfAuths();
  }

  public getKeyFile(): void {
    this.userService.getKeygenFile().pipe(untilDestroyed(this)).subscribe(response => {
      this.dyanmicDownloadByHtmlTag({
        fileName: 'JKAuth Key',
        text: JSON.stringify(response.file)
      });
    });
  }

  private getSelfDetails(): void {
    this.userService.getSelf().pipe(untilDestroyed(this)).subscribe(response => {
      this.username = response.name;
      this.userDetails = response;
    });
  }

  private getSelfPurchases(): void {
    this.userService.getSelfPurchases().pipe(untilDestroyed(this)).subscribe(response => {
      this.purchases = response;
    });
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
