import { Component, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Hwid } from '../../../../shared/models/hwid';
import { ScriptUsers } from '../../../../shared/models/script-users';

import { ScriptService } from '../../../../shared/services/script.service';

@UntilDestroy()
@Component({
  selector: 'app-admin-scripts-details',
  templateUrl: './admin-scripts-details.component.html',
})
export class AdminScriptsDetailsComponent implements OnInit {
  hwidList: Hwid[];
  scriptUsers: ScriptUsers[];

  currentScript: number;
  showHwids: boolean;
  showUser: number;

  constructor(private modalService: NgbModal, private scriptService: ScriptService) { }

  ngOnInit() {
    this.currentScript = this.scriptService.getCurrentScript;
    this.showHwids = false;

    this.getScriptUsers();
    this.getUsersHwid();
  }

  public openSubTable(userId: number): void {
    this.showUser = userId;
    this.showHwids = !this.showHwids;
  }

  private getScriptUsers(): void {
    this.scriptService.getScriptUsers(this.currentScript).pipe(untilDestroyed(this)).subscribe(response => {
      this.scriptUsers = response;
    });
  }

  public getUsersHwid(): void {
    this.scriptService.getHwidByScript(this.currentScript).pipe(untilDestroyed(this)).subscribe(response => {
      this.hwidList = response;
    });
  }
}
