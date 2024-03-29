import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { take } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ScriptService } from '../../../shared/services/script.service';

import { Script } from '../../../shared/models/script';
import { ScriptData } from '../../../shared/models/script-data';

import { SlugifyPipe } from '../../../shared/pipes/slugify.pipe';

import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-admin-scripts',
  templateUrl: './admin-scripts.component.html',
})
export class AdminScriptsComponent implements OnInit {
  allScripts: Script[];
  scriptData: ScriptData[];
  deleteScriptFormData: FormData;
  editScriptForm: FormGroup;
  editScriptFormData: FormData;
  totalRevenue: Array<number>;

  activeUsers: number;
  editScriptName: string;
  insufficentArgs: boolean;
  scriptAlreadyExists: boolean;
  imageTooLarge: boolean;
  imageError: boolean;

  constructor(private router: Router, private formBuilder: FormBuilder, private modalService: NgbModal,
              private scriptService: ScriptService, private slugifyPipe: SlugifyPipe) { }

  ngOnInit() {
    this.totalRevenue = [];
    this.deleteScriptFormData = new FormData();

    this.editScriptForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      editName: [null],
      editPriceFree: [null],
      editPriceDay: [null],
      editPriceWeek: [null],
      editPriceMonth: [null],
      editPriceLife: [null],
      editTrialTime: [null],
      editImage: [null],
      editShard: [null],
      editDescription: [null]
    });

    this.getAllScripts();
  }

  public openModal(content: TemplateRef<any>): void {
    this.insufficentArgs = false;
    this.scriptAlreadyExists = false;
    this.imageTooLarge = false;
    this.imageError = false;

    this.modalService.open(content, { centered: true });
  }

  public closeModal(): void {
    this.modalService.dismissAll();
  }

  public getTotalRevenue(scriptId: number): Promise<object> {
    return this.scriptService.getTotalRevenue(scriptId).pipe(untilDestroyed(this)).pipe(take(1)).toPromise();
  }

  public selectCurrentScript(id: number, scriptName: string, users: boolean): void {
    this.scriptService.setCurrentScript = id;
    if (users) {
      this.router.navigate(['admin/scripts/' + this.slugifyPipe.transform(scriptName)]);
    } else {
      this.router.navigate(['admin/scripts/' + this.slugifyPipe.transform(scriptName) + '/sales']);
    }
  }

  public chooseEditScript(scriptName: string): void {
    this.editScriptName = scriptName;
  }

  public submitEditedScript(): void {
    this.editScriptForm.disable();

    this.editScriptFormData = new FormData();
    this.editScriptFormData.append('sname', this.editScriptName);

    if (this.editScriptForm.get('editPriceFree').value === true) {
      this.editScriptFormData.append('price_eur', '0');
    } else {
      if (this.editScriptForm.get('editPriceDay').value) {
        this.editScriptFormData.append('price_1_day', this.editScriptForm.get('editPriceDay').value);
      }

      if (this.editScriptForm.get('editPriceWeek').value) {
        this.editScriptFormData.append('price_1_week', this.editScriptForm.get('editPriceWeek').value);
      }

      if (this.editScriptForm.get('editPriceMonth').value) {
        this.editScriptFormData.append('price_1_month', this.editScriptForm.get('editPriceMonth').value);
      }

      if (this.editScriptForm.get('editPriceLife').value) {
        this.editScriptFormData.append('price_eur', this.editScriptForm.get('editPriceLife').value);
      } else {
        this.editScriptFormData.append('price_eur', '-1');
      }
    }

    if (this.editScriptForm.get('editName').value) {
      this.editScriptFormData.append('sname_new', this.editScriptForm.get('editName').value);
    }

    if (this.editScriptForm.get('editImage').value) {
      this.editScriptFormData.append('image', this.editScriptForm.get('editImage').value);
    }

    if (this.editScriptForm.get('editShard').value) {
      this.editScriptFormData.append('lua', this.editScriptForm.get('editShard').value);
    }

    if (this.editScriptForm.get('editTrialTime').value) {
      this.editScriptFormData.append('trial_time', this.editScriptForm.get('editTrialTime').value);
    }

    if (this.editScriptForm.get('editDescription').value != null) {
      this.editScriptFormData.append('sinfo', this.editScriptForm.get('editDescription').value);
    }

    this.scriptService.updateScript(this.editScriptFormData).pipe(untilDestroyed(this)).subscribe(
        _ => {
          this.closeModal();
          this.editScriptForm.reset();
          this.editScriptForm.enable();
          this.getAllScripts();
        },
        error => {
          this.editScriptForm.enable();

          if (error.status === 400) {
            this.insufficentArgs = true;
          } else if (error.status === 409) {
            this.scriptAlreadyExists = true;
          } else if (error.status === 413) {
            this.imageTooLarge = true;
          } else if (error.status === 401 || error.status === 500) {
            this.imageError = true;
          }
        }
    );
  }

  public onSelectImage(event: any, control: string): void {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (eventTwo) => {
        if (control === 'image') {
            this.editScriptForm.get('editImage').setValue(eventTwo.target.result);
        } else if (control === 'lua') {
          this.editScriptForm.get('editShard').setValue(eventTwo.target.result);
        }
      };
    }
  }

  public deleteScript(scriptName: string): void {
    this.deleteScriptFormData.append('sname', scriptName);

    Swal.fire({
      title: 'Are you sure you would like to delete ' + scriptName + '?',
      text: 'You won\'t be able to revert this!',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {
        this.scriptService.deleteScripts(this.deleteScriptFormData).pipe(untilDestroyed(this)).subscribe(
            _ => {
              this.getAllScripts();
              Swal.fire(
                  'Deleted!',
                  'The script has been deleted.',
                  'success'
              );
            },
            _ => {
              Swal.fire(
                  'There Was An Issue!',
                  'The script has not been deleted.',
                  'error'
              );
            }
        );
      }
    });
  }

  private getAllScripts(): void {
    this.scriptService.getAllScripts(false).pipe(untilDestroyed(this)).subscribe(response => {
      this.allScripts = response;

      this.scriptData = [];
      this.activeUsers = 0;

      this.allScripts.forEach((result, index) => {
        this.scriptService.getScriptUsers(result.id).pipe(untilDestroyed(this)).subscribe(responseTwo => {
          responseTwo.forEach(responseThree => {
            if (new Date(responseThree.expires_at) >= new Date()) {
              this.activeUsers += 1;
            }
          });

          this.getTotalRevenue(result.id).then(revenue => this.totalRevenue[index] = revenue['sum']);

          this.scriptData[index] = {
            id: result.id,
            totalUsers: responseTwo.length,
            activeUsers: this.activeUsers,
            totalEur: this.totalRevenue[index]
          };

          this.activeUsers = 0;
        });
      });
    });
  }
}
