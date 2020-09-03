import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { CookieService } from 'ngx-cookie-service';

import { AuthService } from '../../shared/services/auth.service';

import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  providers: [AuthService]
})
export class RegisterComponent implements OnInit {
  registrationForm: FormGroup;
  registrationFormData: FormData;

  missingParameter: boolean;
  invalidEmail: boolean;
  userExists: boolean;
  unknownError: boolean;

  constructor(private formBuilder: FormBuilder, private router: Router, private cookieService: CookieService,
              private authService: AuthService) { }

  ngOnInit() {
    this.missingParameter = false;
    this.invalidEmail = false;
    this.userExists = false;
    this.unknownError = false;

    if (this.authService.userValue) {
      this.router.navigate(['/dashboard']);
    }

    this.registrationFormData = new FormData();

    this.registrationForm = this.formBuilder.group({
      username: [null, [Validators.required, Validators.minLength(1)]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      passwordConfirmation: [null, [Validators.required]]
    }, { validator: this.confirmationValidator });
  }

  public submitRegistrationForm(): void {
    this.registrationFormData.append('username', this.registrationForm.get('username').value);
    this.registrationFormData.append('password', this.registrationForm.get('password').value);
    this.registrationFormData.append('mail', this.registrationForm.get('email').value);

    this.authService.register(this.registrationFormData).pipe(untilDestroyed(this)).subscribe(
      _ => {
        Swal.fire({
          title: 'Success!',
          html: 'Redirecting you to the login page!',
          timer: 3000,
          timerProgressBar: true,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error => {
        if (error.status === 400) {
          this.missingParameter = true;
        } else if (error.status === 403) {
          this.invalidEmail = true;
        } else if (error.status === 409) {
          this.userExists = true;
        } else {
          this.unknownError = true;
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
