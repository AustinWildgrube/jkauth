import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AuthService } from '../../../shared/services/auth.service';
import Swal from "sweetalert2";
import {Router} from "@angular/router";

@UntilDestroy()
@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
})
export class ResetComponent implements OnInit {
  resetForm: FormGroup;
  resetFormData: FormData;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.resetFormData = new FormData();

    this.resetForm = this.formBuilder.group({
      password: [null, [Validators.required, Validators.minLength(1)]],
      passwordConfirmation: [null, [Validators.required, Validators.minLength(1)]],
    }, { validator: this.confirmationValidator });
  }

  public submitResetForm(): void {
    this.resetFormData.append('password', this.resetForm.get('password').value);
    this.resetFormData.append('rcode',
        window.location.href.substr(window.location.href.lastIndexOf('/') + 1)
    );

    this.authService.modifyPassword(this.resetFormData).pipe(untilDestroyed(this)).subscribe(
      () => {
        Swal.fire({
          title: 'Success!',
          text: 'Your password has been reset. Try loggin in again',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        }).then(() => {
          this.router.navigate(['/authentication/login']);
        });
      },
      error => {
        if (error.status === 404) {
          Swal.fire({
            title: 'Something went wrong!',
            text: 'It appears that the email you used to recieve this reset isn\'t attached to an account. Try again'
            + 'using a different email',
            icon: 'error',
            timer: 6000,
            timerProgressBar: true,
            onBeforeOpen: () => {
              Swal.showLoading();
            },
          });
        }
      }
    );
  }

  private confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    const password = control.get('password');
    const confirmPassword = control.get('passwordConfirmation');

    if (password.pristine || confirmPassword.pristine) {
      return null;
    }

    if (password.value === confirmPassword.value) {
      return null;
    }

    return { confirm: true, error: true };
  }
}
