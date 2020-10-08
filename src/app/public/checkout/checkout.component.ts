import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AdminUser } from '../../shared/models/admin-user';
import { PurchaseProduct } from '../../shared/models/purchase-product';

import { PaypalService } from '../../shared/services/paypal.service';
import { CartService } from '../../shared/services/cart.service';
import { ScriptService } from '../../shared/services/script.service';
import { CoinpaymentService } from '../../shared/services/coinpayment.service';
import { UserService } from '../../shared/services/user.service';

import { CartItem } from '../../shared/models/cart-item';

import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  cartInventory: CartItem[];
  cartInventoryTemp: Array<any>;
  purchaseCartInventory: PurchaseProduct[];
  userInfo: AdminUser;
  amberNameForm: FormGroup;

  cartTotal: number;
  isAmber: boolean;

  constructor(private formBuilder: FormBuilder, private router: Router, private modalService: NgbModal,
              private coinpaymentsService: CoinpaymentService, private paypalService: PaypalService,
              private cartService: CartService, private scriptService: ScriptService,
              private userService: UserService) { }

  ngOnInit() {
    this.cartInventory = [];
    this.cartInventoryTemp = [];

    this.cartTotal = 0;

    this.amberNameForm = this.formBuilder.group({
      auroraName: [null, [Validators.required]],
    });

    this.getCart();
    this.getUserInfo();

    this.cartService.checkout();
  }

  public openModal(content: TemplateRef<any>): void {
    this.modalService.open(content, { centered: true });
  }

  public closeModal(): void {
    this.modalService.dismissAll();
  }

  public getCart(): void {
    this.cartService.state$.subscribe(response => {
      this.isAmber = false;
      this.cartInventory = response.cart;
      this.cartTotal = response.total;

      if (this.cartTotal === 0) {
        this.router.navigate(['/']);
      }

      this.purchaseCartInventory = [];
      this.cartInventory.forEach(responseTwo => {
        this.purchaseCartInventory.push({
          product: responseTwo.id,
          amount: responseTwo.amount,
          duration: responseTwo.purchaseLength
        });

        // TODO: Change Aurorabot id to non-hard coded value
        if (responseTwo.id === 38) {
          this.isAmber = true;
        }
      });
    });
  }

  public deleteProduct(product: CartItem): void {
    this.cartService.removeCartItem(product);
  }

  public choosePaymentOption(): void {
    Swal.fire({
      title: 'How would you like to pay?',
      text: 'After choosing an option you will be taken to the respective payments website. After completion you will' +
          ' be returned here',
      showConfirmButton: true,
      showCancelButton: !this.isAmber,
      confirmButtonText: 'Crypto',
      cancelButtonText: 'PayPal'
    }).then((result) => {
      if (result.value) {
        if (this.isAmber) {
          this.createCoinpaymentsOrder(true);
        } else {
          this.createCoinpaymentsOrder(false);
        }

        Swal.fire({
          title: 'Redirecting you to CoinPayments Website!',
          html: 'One moment!',
          timer: 10000,
          timerProgressBar: true,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.createPaypalOrder();

        Swal.fire({
          title: 'Redirecting you to PayPals Website!',
          html: 'One moment!',
          timer: 10000,
          timerProgressBar: true,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
      }
    });
  }

  public createPaypalOrder(): void {
    const formData = new FormData();
    formData.append('products', JSON.stringify(this.purchaseCartInventory));
    formData.append('email', this.userInfo.login_mail);

    this.paypalService.createOrder(formData).pipe(untilDestroyed(this)).subscribe(response => {
      window.location.href = response['result']['links'][1]['href'];
    });
  }

  public createCoinpaymentsOrder(isAmber: boolean): void {
    const formData = new FormData();
    formData.append('products', JSON.stringify(this.purchaseCartInventory));
    formData.append('email', this.userInfo.login_mail);

    if (isAmber) {
      formData.append('username', this.amberNameForm.get('auroraName').value);
    }

    this.coinpaymentsService.createOrder(formData).pipe(untilDestroyed(this)).subscribe(response => {
      window.location.href = response['result']['checkout_url'];
    });
  }

  private getUserInfo(): void {
    this.userService.getSelf().subscribe(response => {
      this.userInfo = response;
    });
  }
}
