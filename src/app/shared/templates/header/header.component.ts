import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { User } from '../../models/user';
import { Script } from '../../models/script';

import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ScriptService } from '../../services/script.service';
import { UserService } from '../../services/user.service';

import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  userDetails: User;
  cartInventory: Script[];
  settingsForm: FormGroup;
  hanbotFormData: FormData;

  username: string;
  cartTotal: number;
  cartInventoryLength: number;
  isAuthenticated: boolean;
  cart: boolean;
  account: boolean;
  mobileMenu: boolean;

  constructor(private formBuilder: FormBuilder, private modalService: NgbModal, private authService: AuthService,
              private cartService: CartService, private scriptService: ScriptService,
              private userService: UserService) { }

  ngOnInit() {
    this.cartInventory = [];
    this.cartInventoryLength = 0;
    this.cartTotal = 0;
    this.isAuthenticated = false;
    this.cart = false;
    this.account = false;
    this.mobileMenu = false;

    this.hanbotFormData = new FormData();

    this.settingsForm = this.formBuilder.group({
      hanbotId: [null, [Validators.required, Validators.minLength(1)]],
    });

    if (this.authService.userValue != null) {
      this.isAuthenticated = true;
      this.userDetails = this.authService.userValue;
      this.getOwnDetails();
    }

    this.getCart();
  }

  public openModal(content: TemplateRef<any>): void {
    this.modalService.open(content, { centered: true });
  }

  public closeModal(): void {
    this.modalService.dismissAll();
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
          this.scriptService.getScriptDetails(responseTwo['productId']).pipe(untilDestroyed(this)).subscribe(
          responseThree => {
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

  public submitSettingsForm(): void {
    this.hanbotFormData.append('hanbot_id', this.settingsForm.get('hanbotId').value);

    this.userService.updateHanbotId(this.hanbotFormData).pipe(untilDestroyed(this)).subscribe(
      _ => {
        Swal.fire({
          title: 'Success!',
          html: 'Your account has been updated!',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          icon: 'success'
        }).then(() => {
          this.closeModal();
        });
      },
      _ => {
        Swal.fire({
          title: 'There was a problem!',
          html: 'Please contact an admin!',
          icon: 'error',
          timer: 3000
        });
      }
    );
  }

  private getOwnDetails(): void {
    this.userService.getSelf().pipe(untilDestroyed((this))).subscribe(response => {
      this.username = response.name;
    });
  }
}
