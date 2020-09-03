import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { AuthService } from '../../shared/services/auth.service';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginFormData: FormData;

  failedLogin: boolean;
  returnUrl: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private formBuilder: FormBuilder,
              private authService: AuthService) { }

  ngOnInit() {
    if (this.authService.userValue) {
      this.router.navigate(['/dashboard']);
    }

    this.loginFormData = new FormData();

    this.loginForm = this.formBuilder.group({
      username: [null, [Validators.required, Validators.minLength(1)]],
      password: [null, [Validators.required]],
    });

    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
  }

  public submitLoginForm(): void {
    this.loginFormData.append('username', this.loginForm.get('username').value);
    this.loginFormData.append('password', this.loginForm.get('password').value);

    this.authService.login(this.loginFormData).pipe(untilDestroyed(this)).subscribe(
      _ => {
        this.router.navigate([this.returnUrl]);
      },
      error => {
        if (error.status === 401 || error.status === 403) {
          this.failedLogin = true;
        }
      }
    );
  }
}
