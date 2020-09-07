import {Component, OnInit, TemplateRef} from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ScriptService } from '../../../shared/services/script.service';

import { Script } from '../../../shared/models/script';
import { ScriptData } from '../../../shared/models/script-data';

import { SlugifyPipe } from '../../../shared/pipes/slugify.pipe';

import Swal from 'sweetalert2';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

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

  activeUsers: number;
  editScriptName: string;
  insufficentArgs: boolean;
  scriptAlreadyExists: boolean;
  imageTooLarge: boolean;
  imageError: boolean;

  constructor(private router: Router, private formBuilder: FormBuilder, private modalService: NgbModal,
              private scriptService: ScriptService, private slugifyPipe: SlugifyPipe) { }

  ngOnInit() {
    this.deleteScriptFormData = new FormData();

    this.editScriptForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      editName: [null],
      editPrice: [null],
      editTrialTime: [null],
      editImage: [null],
      editShard: [null]
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

  public selectCurrentScript(id: number, scriptName: string): void {
    this.scriptService.setCurrentScript = id;
    this.router.navigate(['admin/scripts/' + this.slugifyPipe.transform(scriptName)]);
  }

  public chooseEditScript(scriptName: string): void {
    this.editScriptName = scriptName;
  }

  public submitEditedScript(): void {
    this.editScriptForm.disable();

    this.editScriptFormData = new FormData();
    this.editScriptFormData.append('sname', this.editScriptName);

    if (this.editScriptForm.get('editName').value) {
      this.editScriptFormData.append('sname_new', this.editScriptForm.get('editName').value);
    }

    if (this.editScriptForm.get('editPrice').value) {
      this.editScriptFormData.append('price_eur', this.editScriptForm.get('editPrice').value);
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
    this.scriptService.getAllScripts().pipe(untilDestroyed(this)).subscribe(response => {
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
