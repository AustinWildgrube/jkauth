import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cookie-message',
  templateUrl: './cookie-message.component.html',
})
export class CookieMessageComponent implements OnInit {
  showCookieMessage: boolean;
  hasResponded: boolean;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.hasResponded = !!sessionStorage.getItem('jkcookies');
    this.showCookieMessage = true;

    this.showCookieBox();
  }

  public useCookie(answer: boolean): void {
    if (answer === true) {
      this.authService.useCookies = true;
      this.showCookieMessage = false;
      this.hasResponded = true;

      localStorage.setItem('jkcookies', 'true');
    } else {
      this.authService.useCookies = false;
      this.showCookieMessage = false;
      this.hasResponded = true;

      sessionStorage.setItem('jkcookies', 'false');
    }
  }

  private showCookieBox(): void {
    if ((this.authService.useCookies === false && this.hasResponded === true) || this.authService.useCookies === true) {
      this.showCookieMessage = false;
    }
  }
}
