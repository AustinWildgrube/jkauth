import { Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

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

  cartTotal: number;
  isAmber: boolean;

  constructor(private coinpaymentsService: CoinpaymentService, private paypalService: PaypalService,
              private cartService: CartService, private scriptService: ScriptService,
              private userService: UserService) { }

  ngOnInit() {
    this.cartInventory = [];
    this.cartInventoryTemp = [];
    this.purchaseCartInventory = [];

    this.cartTotal = 0;

    this.getCart();
    this.getUserInfo();

    this.cartService.checkout();
  }

  public getCart(): void {
    this.cartService.state$.subscribe(response => {
      this.isAmber = false;
      this.cartInventory = response.cart;
      this.cartTotal = response.total;

      this.cartInventory.forEach(responseTwo => {
        this.purchaseCartInventory.push({
          product: responseTwo.id,
          amount: responseTwo.amount
        });

        // TODO: Change Aurorabot id to non-hard coded value
        if (responseTwo.id === 38) {
          this.isAmber = true;
        }
      });
    });
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
        this.createCoinpaymentsOrder();

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
      window.location.href = response['links'][1]['href'];
    });
  }

  public createCoinpaymentsOrder(): void {
    const formData = new FormData();
    formData.append('products', JSON.stringify(this.purchaseCartInventory));
    formData.append('email', this.userInfo.login_mail);

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
