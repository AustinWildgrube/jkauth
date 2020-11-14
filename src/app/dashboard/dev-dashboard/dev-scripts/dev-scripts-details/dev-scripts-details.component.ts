import { Component, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ScriptUsers } from '../../../../shared/models/script-users';
import { Hwid } from '../../../../shared/models/hwid';

import { ScriptService } from '../../../../shared/services/script.service';

@UntilDestroy()
@Component({
  selector: 'app-dev-scripts-details',
  templateUrl: './dev-scripts-details.component.html',
})
export class DevScriptsDetailsComponent implements OnInit {
  scriptUsers: ScriptUsers[];
  hwidList: Hwid[];

  currentScript: number;
  showUser: number;
  usersPage: number;
  showHwids: boolean;
  searchTerm: string;

  constructor(private modalService: NgbModal, private scriptService: ScriptService) { }

  ngOnInit() {
    this.currentScript = this.scriptService.getCurrentScript;
    this.usersPage = 0;
    this.showHwids = false;

    this.getScriptUsers();
    this.getUsersHwid();
  }

  public openSubTable(userId: number): void {
    this.showUser = userId;
    this.showHwids = !this.showHwids;
  }

  public getUsersHwid(): void {
    this.scriptService.getHwidByScript(this.currentScript).pipe(untilDestroyed(this)).subscribe(response => {
      this.hwidList = response;
    });
  }

  private getScriptUsers(): void {
    this.scriptService.getScriptUsers(this.currentScript).pipe(untilDestroyed(this)).subscribe(response => {
      this.scriptUsers = response;
    });
  }
}
