import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AuthService } from '../../shared/services/auth.service';

import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  forgotFormData: FormData;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) { }

  ngOnInit() {
    this.forgotFormData = new FormData();

    this.forgotForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.minLength(1)]],
    });
  }

  public submitForgotForm(): void {
    this.forgotFormData.append('email', this.forgotForm.get('email').value);

    this.authService.forgotPassword(this.forgotFormData).pipe(untilDestroyed(this)).subscribe(_ => {
      Swal.fire({
        title: 'Success!',
        text: 'An email has been sent.',
        timer: 3000,
        timerProgressBar: true,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
    },
    error => {
      if (error.status === 200) {
        Swal.fire({
          title: 'Success!',
          text: 'An email has been sent.',
          timer: 3000,
          timerProgressBar: true,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
      } else {
        Swal.fire({
          title: 'An error has occured!',
          text: 'Please contact an admin.',
          timer: 3000,
          timerProgressBar: true,
          icon: 'error',
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
      }
    });
  }
}
