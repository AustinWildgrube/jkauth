import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { User } from '../../models/user';
import { Script } from '../../models/script';

import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ScriptService } from '../../services/script.service';
import { UserService } from '../../services/user.service';
import { ResellerService } from '../../services/reseller.service';

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
  redeemKeysForm: FormGroup;

  username: string;
  cartTotal: number;
  cartInventoryLength: number;
  isAuthenticated: boolean;
  cart: boolean;
  account: boolean;
  mobileMenu: boolean;
  notFound: boolean;
  alreadyRedeemed: boolean;
  idInputEmpty: boolean;
  isUser: boolean;

  constructor(private router: Router, private formBuilder: FormBuilder, private modalService: NgbModal,
              private authService: AuthService, private cartService: CartService, private scriptService: ScriptService,
              private userService: UserService, private resellerService: ResellerService) { }

  ngOnInit() {
    this.cartInventory = [];
    this.cartInventoryLength = 0;
    this.cartTotal = 0;
    this.isAuthenticated = false;
    this.cart = false;
    this.account = false;
    this.mobileMenu = false;
    this.notFound = false;
    this.alreadyRedeemed = false;
    this.isUser = true;

    this.settingsForm = this.formBuilder.group({
      hanbotId: [null, [Validators.required, Validators.minLength(1)]],
    });

    this.redeemKeysForm = this.formBuilder.group({
      key: [null, [Validators.required, Validators.minLength(1)]],
    });

    if (this.authService.userValue != null) {
      this.isAuthenticated = true;
      this.userDetails = this.authService.userValue;
      this.getOwnDetails();

      for (const role of this.userDetails.role) {
        if (role !== 'user') {
          this.isUser = false;
        }
      }
    }

    this.getCart();
  }

  public openModal(content: TemplateRef<any>): void {
    this.idInputEmpty = false;
    this.notFound = false;
    this.alreadyRedeemed = false;
    this.redeemKeysForm.reset();

    this.modalService.open(content, { centered: true });
  }

  public closeModal(): void {
    this.modalService.dismissAll();
  }

  public toggleMobileMenu(): void {
    this.mobileMenu = !this.mobileMenu;
  }

  public getCart(): void {
    this.cartService.state$.subscribe(response => {
      this.cartInventory = response.cart;
      this.cartInventoryLength = response.cart.length;
    });
  }

  public deleteFomCart(product: any): void {
    this.cartService.removeCartItem(product);
  }

  public logout(): void {
    this.isAuthenticated = false;
    this.authService.logout();
  }

  public submitSettingsForm(): void {
    if (this.settingsForm.get('hanbotId').value) {
      this.idInputEmpty = false;
      this.hanbotFormData = new FormData();
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
    } else {
      this.idInputEmpty = true;
    }
  }

  public redeemResellerKey(): void {
    this.resellerService.redeemResellerKey(this.redeemKeysForm.get('key').value).pipe(untilDestroyed(this)).subscribe(
      () => {
      Swal.fire({
        title: 'Success!',
        html: 'Your key has been activated!',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        icon: 'success'
      }).then(() => {
        this.closeModal();
        this.router.navigate(['/account']);
      });
    },
    error => {
      if (error.status === 404) {
        this.notFound = true;
      } else if (error.status === 409) {
        this.alreadyRedeemed = true;
      }
    });
  }

  private getOwnDetails(): void {
    this.userService.getSelf().pipe(untilDestroyed((this))).subscribe(response => {
      this.username = response.name;
    });
  }
}
