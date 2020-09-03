import { Component, OnInit } from '@angular/core';

import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { User } from '../../models/user';
import { Script } from '../../models/script';

import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ScriptService } from '../../services/script.service';
import { UserService } from '../../services/user.service';

@UntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  userDetails: User;
  cartInventory: Script[];

  username: string;
  cartTotal: number;
  cartInventoryLength: number;
  isAuthenticated: boolean;
  cart: boolean;
  account: boolean;
  mobileMenu: boolean;

  constructor(private authService: AuthService, private cartService: CartService, private scriptService: ScriptService,
              private userService: UserService) { }

  ngOnInit() {
    this.cartInventory = [];
    this.cartInventoryLength = 0;
    this.cartTotal = 0;
    this.isAuthenticated = false;
    this.cart = false;
    this.account = false;
    this.mobileMenu = false;

    if (this.authService.userValue != null) {
      this.isAuthenticated = true;
      this.userDetails = this.authService.userValue;
    }

    this.getCart();
    this.getOwnDetails();
  }

  public toggleMobileMenu(): void {
    this.mobileMenu = !this.mobileMenu;
  }

  public getCart(): void {
    if (this.cartService.cart.value != null) {
      this.cartService.cart.pipe(untilDestroyed(this)).subscribe(response => {
        this.cartInventoryLength = Object.keys(response).length;
        this.cartInventory = [];

        Object.values(response).forEach((responseTwo, index) => {
          this.scriptService.getScriptDetails(responseTwo['productId']).pipe(untilDestroyed(this)).subscribe(responseThree => {
            if (responseThree[0]) {
              this.cartInventory.push(responseThree[0]);
              this.cartTotal += responseThree[0].price_eur;
            }
          });
        });
      });
    }
  }

  public deleteFomCart(scriptId: number): void {
    this.cartService.deleteFromCart(scriptId);
  }

  public logout(): void {
    this.isAuthenticated = false;
    this.authService.logout();
  }

  private getOwnDetails(): void {
    this.userService.getSelf().pipe(untilDestroyed((this))).subscribe(response => {
      this.username = response.name;
    });
  }
}
