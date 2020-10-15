import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ScriptService } from '../../../shared/services/script.service';
import { SlugifyPipe } from '../../../shared/pipes/slugify.pipe';
import { Script } from '../../../shared/models/script';
import { ScriptData } from '../../../shared/models/script-data';

import Swal from 'sweetalert2';
import {take} from "rxjs/operators";

@UntilDestroy()
@Component({
  selector: 'app-dev-scripts',
  templateUrl: './dev-scripts.component.html',
})
export class DevScriptsComponent implements OnInit {
  scriptsList: Script[];
  scriptData: ScriptData[];
  addScriptForm: FormGroup;
  editScriptForm: FormGroup;
  authModuleForm: FormGroup;
  addScriptFormData: FormData;
  editScriptFormData: FormData;
  deleteScriptFormData: FormData;
  totalRevenue: Array<number>;

  activeUsers: number;
  authModuleId: number;
  addScriptBuffering: boolean;
  insufficentArgs: boolean;
  scriptAlreadyExists: boolean;
  imageTooLarge: boolean;
  imageError: boolean;
  imageData: string | ArrayBuffer;
  editScriptName: string;
  authModuleResponse: string;
  devLoaderResponse: string;

  setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };

  @ViewChild('authModuleCodeModal') authModuleCodeTemplate: TemplateRef<any>;

  constructor(private router: Router, private formBuilder: FormBuilder, private modalService: NgbModal,
              private scriptService: ScriptService, private slugifyPipe: SlugifyPipe) { }

  ngOnInit() {
    this.totalRevenue = [];
    this.addScriptFormData = new FormData();
    this.editScriptFormData = new FormData();

    this.addScriptBuffering = false;
    this.insufficentArgs = false;
    this.scriptAlreadyExists = false;
    this.imageTooLarge = false;
    this.imageError = false;

    this.authModuleForm = this.formBuilder.group({
      callback: [null, [Validators.required]],
    });

    this.addScriptForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      priceDay: [null],
      priceWeek: [null],
      priceMonth: [null],
      priceLife: [null],
      trialTime: [null],
      shard: [null],
      image: [null, [Validators.required]],
      description: [null]
    });

    this.editScriptForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      editName: [null],
      editPriceDay: [null],
      editPriceWeek: [null],
      editPriceMonth: [null],
      editPriceLife: [null],
      editTrialTime: [null],
      editImage: [null],
      editShard: [null],
      editDescription: [null]
    });

    this.getScripts();
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

  public chooseModuleScript(scriptId: number): void {
    this.authModuleId = scriptId;
  }

  public chooseEditScript(scriptName: string): void {
    this.editScriptName = scriptName;
  }

  public submitScript(): void {
    this.addScriptBuffering = true;
    this.addScriptForm.disable();

    this.addScriptFormData = new FormData();
    this.addScriptFormData.append('sname', this.addScriptForm.get('name').value);
    this.addScriptFormData.append('image', this.addScriptForm.get('image').value);

    if (this.addScriptForm.get('priceDay').value) {
      this.addScriptFormData.append('price_1_day', this.addScriptForm.get('priceDay').value);
    }

    if (this.addScriptForm.get('priceWeek').value) {
      this.addScriptFormData.append('price_1_week', this.addScriptForm.get('priceWeek').value);
    }

    if (this.addScriptForm.get('priceMonth').value) {
      this.addScriptFormData.append('price_1_month', this.addScriptForm.get('priceMonth').value);
    }

    if (this.addScriptForm.get('priceLife').value) {
      this.addScriptFormData.append('price_eur', this.addScriptForm.get('priceLife').value);
    } else if (this.addScriptForm.get('priceDay').value || this.addScriptForm.get('priceWeek').value ||
               this.addScriptForm.get('priceMonth').value) {
      this.addScriptFormData.append('price_eur', '9999999');
    }

    if (this.addScriptForm.get('shard').value) {
      this.addScriptFormData.append('lua', this.addScriptForm.get('shard').value);
    }

    if (this.addScriptForm.get('trialTime').value) {
      this.addScriptFormData.append('trial_time', this.addScriptForm.get('trialTime').value);
    }

    if (this.addScriptForm.get('description').value) {
      this.addScriptFormData.append('sinfo', this.addScriptForm.get('description').value);
    }

    this.scriptService.newScript(this.addScriptFormData).pipe(untilDestroyed(this)).subscribe(
        _ => {
          this.closeModal();
          this.addScriptForm.reset();
          this.getScripts();
          this.addScriptBuffering = false;
          this.addScriptForm.enable();
        },
        error => {
          this.addScriptBuffering = false;
          this.addScriptForm.enable();

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

  public submitEditedScript(): void {
    this.editScriptForm.disable();

    this.editScriptFormData = new FormData();
    this.editScriptFormData.append('sname', this.editScriptName);

    if (this.editScriptForm.get('editName').value) {
      this.editScriptFormData.append('sname_new', this.editScriptForm.get('editName').value);
    }

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

    if (this.editScriptForm.get('editDescription').value) {
      this.editScriptFormData.append('sinfo', this.editScriptForm.get('editDescription').value);
    }

    this.scriptService.updateScript(this.editScriptFormData).pipe(untilDestroyed(this)).subscribe(
        _ => {
          this.closeModal();
          this.editScriptForm.reset();
          this.editScriptForm.enable();
          this.getScripts();
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

  public deleteScript(scriptName: string): void {
    this.deleteScriptFormData = new FormData();
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
            this.getScripts();
            Swal.fire(
                'Deleted!',
                'Your script has been deleted.',
                'success'
            );
          },
          _ => {
            // TODO: Fix
            // Swal.fire(
            //     'There Was An Issue!',
            //     'Your script has not been deleted. Please contact an admin.',
            //     'error'
            // );

            this.getScripts();
            Swal.fire(
                'Deleted!',
                'Your script has been deleted.',
                'success'
            );
          }
        );
      }
    });
  }

  public selectCurrentScript(id: number, scriptName: string, users: boolean): void {
    this.scriptService.setCurrentScript = id;
    if (users) {
      this.router.navigate(['dashboard/scripts/' + this.slugifyPipe.transform(scriptName)]);
    } else {
      this.router.navigate(['dashboard/scripts/' + this.slugifyPipe.transform(scriptName) + '/sales']);
    }
  }

  public onSelectImage(event: any, control: string, actionType: string): void {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (eventTwo) => {
        if (control === 'image') {
          if (actionType === 'add') {
            this.addScriptForm.get('image').setValue(eventTwo.target.result);
          } else {
            this.editScriptForm.get('editImage').setValue(eventTwo.target.result);
          }
        } else if (control === 'lua') {
          if (actionType === 'add') {
            this.addScriptForm.get('shard').setValue(eventTwo.target.result);
          } else {
            this.editScriptForm.get('editShard').setValue(eventTwo.target.result);
          }
        }
      };
    }
  }

  public getAuthModule(): void {
    this.scriptService.getAuthModule(this.authModuleId, this.authModuleForm.get('callback').value)
        .pipe(untilDestroyed(this)).subscribe(response => {
      this.authModuleResponse = response;
      this.closeModal();
      this.openModal(this.authModuleCodeTemplate);
    });
  }

  public copyInputMessage(inputElement) {
    const copyText = document.getElementById(inputElement).textContent;
    const textArea = document.createElement('textarea');
    textArea.style.position = 'absolute';
    textArea.style.left = '-10000px';
    textArea.textContent = copyText;
    document.body.append(textArea);
    textArea.select();
    document.execCommand('copy');

    Swal.fire({
      title: 'Copied!',
      text: 'The code has been copied to your clipboard.',
      timer: 2000,
      timerProgressBar: true,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    }).then(() => {
      this.closeModal();
    });
  }

  public getDevLoader(scriptId: number): void {
    this.scriptService.getDevLoader(scriptId).subscribe(response => {
      this.devLoaderResponse = response;
    });
  }

  private getScripts(): void {
    this.scriptService.getScripts().pipe(untilDestroyed(this)).subscribe(response => {
      this.scriptsList = response;
      this.scriptData = [];
      this.activeUsers = 0;

      this.scriptsList.forEach((result, index) => {
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
