import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart: BehaviorSubject<Array<any>> = new BehaviorSubject<Array<any>>(JSON.parse(sessionStorage.getItem('cart')));

  tempCart: Array<any>;
  isInCart: boolean;
  cartIndex: number;
  scriptIndex: number;

  constructor() {}

  public addToCart(id: number): void {
    this.tempCart = sessionStorage.getItem('cart') ? JSON.parse(sessionStorage.getItem('cart')) : [];

    this.isInCart = this.tempCart.some((productId) => productId.productId === id);

    if (this.isInCart) {
      this.cartIndex = this.tempCart.findIndex(x => x.productId === id);
      this.tempCart[this.cartIndex].amount += 1;
    } else {
      this.tempCart.push({
        productId: id,
        amount: 1
      });
    }

    sessionStorage.setItem('cart', JSON.stringify(this.tempCart));
    this.cart.next(this.tempCart);
  }

  public deleteFromCart(scriptId: number): void {
    this.tempCart = JSON.parse(sessionStorage.getItem('cart'));

    this.scriptIndex = this.tempCart.findIndex(obj => obj.productId === scriptId);

    this.tempCart.splice(this.scriptIndex, 1);

    sessionStorage.setItem('cart', JSON.stringify(this.tempCart));
    this.cart.next(this.tempCart);
  }

  public emptyCart(): void {
    this.cart.next(null);
  }
}
