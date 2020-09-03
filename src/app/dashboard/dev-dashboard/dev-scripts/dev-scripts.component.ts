import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ScriptService } from '../../../shared/services/script.service';
import { SlugifyPipe } from '../../../shared/pipes/slugify.pipe';
import { Script } from '../../../shared/models/script';
import { ScriptData } from '../../../shared/models/script-data';

import Swal from 'sweetalert2';

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
  addScriptFormData: FormData;
  editScriptFormData: FormData;
  deleteScriptFormData: FormData;

  activeUsers: number;
  addScriptBuffering: boolean;
  insufficentArgs: boolean;
  scriptAlreadyExists: boolean;
  imageTooLarge: boolean;
  imageError: boolean;
  imageData: string | ArrayBuffer;
  editScriptName: string;

  constructor(private router: Router, private formBuilder: FormBuilder, private modalService: NgbModal,
              private scriptService: ScriptService, private slugifyPipe: SlugifyPipe) { }

  ngOnInit() {
    this.addScriptFormData = new FormData();
    this.editScriptFormData = new FormData();

    this.addScriptBuffering = false;
    this.insufficentArgs = false;
    this.scriptAlreadyExists = false;
    this.imageTooLarge = false;
    this.imageError = false;

    this.addScriptForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      price: [null, [Validators.required]],
      shard: [null, [Validators.required]],
      trialTime: [null, [Validators.required]],
      image: [null]
    });

    this.editScriptForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      editName: [null],
      editPrice: [null],
      editTrialTime: [null],
      editImage: [null],
      editShard: [null]
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

  public chooseEditScript(scriptName: string): void {
    this.editScriptName = scriptName;
  }

  public submitScript(): void {
    this.addScriptBuffering = true;
    this.addScriptForm.disable();

    this.addScriptFormData = new FormData();
    this.addScriptFormData.append('sname', this.addScriptForm.get('name').value);
    this.addScriptFormData.append('price_eur', this.addScriptForm.get('price').value);
    this.addScriptFormData.append('lua', this.addScriptForm.get('shard').value);
    this.addScriptFormData.append('trial_time', this.addScriptForm.get('trialTime').value);
    this.addScriptFormData.append('image', this.addScriptForm.get('image').value);

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

    if (this.editScriptForm.get('editPrice').value) {
      this.editScriptFormData.append('price_usd', this.editScriptForm.get('editPrice').value);
    }

    if (this.editScriptForm.get('editShard').value) {
      this.editScriptFormData.append('lua', this.editScriptForm.get('editShard').value);
    }

    if (this.editScriptForm.get('editTrialTime').value) {
      this.editScriptFormData.append('trial_time', this.editScriptForm.get('editTrialTime').value);
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

  public selectCurrentScript(id: number, scriptName: string): void {
    this.scriptService.setCurrentScript = id;
    this.router.navigate(['dashboard/scripts/' + this.slugifyPipe.transform(scriptName)]);
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

          this.scriptData[index] = {
            id: result.id,
            totalUsers: responseTwo.length,
            activeUsers: this.activeUsers,
            totalUsd: result.price_eur * responseTwo.length
          };

          this.activeUsers = 0;
        });
      });
    });
  }
}
