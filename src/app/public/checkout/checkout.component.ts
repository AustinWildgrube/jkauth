import { Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Script } from '../../shared/models/script';
import { AdminUser } from '../../shared/models/admin-user';
import { PurchaseProduct } from '../../shared/models/purchase-product';

import { PaypalService } from '../../shared/services/paypal.service';
import { CartService } from '../../shared/services/cart.service';
import { AdminService } from '../../shared/services/admin.service';
import { ScriptService } from '../../shared/services/script.service';
import { CoinpaymentService } from '../../shared/services/coinpayment.service';
import { UserService } from '../../shared/services/user.service';

import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  cartInventory: Script[];
  cartInventoryTemp: Array<any>;
  purchaseCartInventory: PurchaseProduct[];
  userInfo: AdminUser;

  cartTotal: number;
  cartIndex: number;

  constructor(private coinpaymentsService: CoinpaymentService, private paypalService: PaypalService, private cartService: CartService,
              private scriptService: ScriptService, private userService: UserService, private adminService: AdminService) { }

  ngOnInit() {
    this.cartInventory = [];
    this.cartInventoryTemp = [];
    this.purchaseCartInventory = [];

    this.cartTotal = 0;

    this.getCart();
    this.getUserInfo();
  }

  public getCart(): void {
    this.cartIndex = 0;

    if (this.cartService.cart.value != null) {
      this.cartService.cart.subscribe(response => {
        response.forEach((_, index) => {
          this.scriptService.getScriptDetails(response[index].productId).subscribe(responseTwo => {
            this.cartInventory.splice(this.cartIndex, 0, responseTwo[0]);
            this.cartInventory[this.cartIndex].amount = response[0].amount;
            this.cartTotal += responseTwo[0].price_eur * responseTwo[0].amount;

            this.adminService.getUserDetails(responseTwo[0].author).pipe(untilDestroyed(this)).subscribe(responseThree => {
              this.cartInventory[this.cartIndex].name = responseThree[0].name;
              this.cartIndex++;
            });
          });
        });
      });
    }
  }

  public choosePaymentOption(): void {
    Swal.fire({
      title: 'How would you like to pay?',
      text: 'After choosing an option you will be taken to the respective payments website. After completion you will be returned here',
      showCancelButton: true,
      confirmButtonText: 'Crypto',
      cancelButtonText: 'PayPal'
    }).then((result) => {
      if (result.value) {
        this.createCoinpaymentsOrder();
        this.emptyCart();

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
        this.emptyCart();

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

  private emptyCart(): void {
    this.cartService.emptyCart();
  }
}
