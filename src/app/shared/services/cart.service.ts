import { Injectable } from '@angular/core';
import { Observable, of, merge, Subject, BehaviorSubject } from 'rxjs';
import { scan, startWith, map, tap, combineLatest, switchMap, shareReplay, debounceTime, first } from 'rxjs/operators';

import { v4 as uuid } from 'uuid';

import { CartItem } from '../models/cart-item';
import { StateTree } from '../models/state-tree';

@Injectable()
export class CartService {
  DATA_ITEMS = sessionStorage.getItem('cart') ? JSON.parse(sessionStorage.getItem('cart')) : [];
  alreadyInCart: boolean;

  private stateTree = new BehaviorSubject<StateTree>(null);
  private checkoutTrigger = new BehaviorSubject<boolean>(false);
  private cartRemove = new Subject<CartItem>();
  private cartAdd = new Subject<CartItem>();

  constructor() { }

  public state$: Observable<StateTree> = this.stateTree.pipe(
      switchMap(() => this.getItems().pipe(
          combineLatest([this.cart, this.total, this.checkoutTrigger]),
          debounceTime(0),
      )),
      map(([store, cart, total, checkout]: any) => ({ store, cart, total, checkout })),
      tap(state => {
        if (state.checkout) {
          // console.log('checkout', state);
        }
      }),
      shareReplay(1)
  );

  public addCartItem(item: CartItem) {
    this.alreadyInCart = false;
    delete item.author;
    delete item.trial_time;

    this.state$.pipe(first()).subscribe(product => {
      product.cart.forEach(test => {
        item.amount += test.amount;

        if (test.id === item.id) {
          if (item.id === 38) {
            if (item.amount >= 1 && item.amount <= 19) {
              item.price_1_month = 4.5;
            } else if (item.amount >= 20 && item.amount <= 49) {
              item.price_1_month = 4;
            } else if (item.amount >= 50 && item.amount <= 99) {
              item.price_1_month = 3.5;
            } else if (item.amount >= 100 && item.amount <= 199) {
              item.price_1_month = 3;
            } else if (item.amount >= 200) {
              item.price_1_month = 2.5;
            }
          }

          this.alreadyInCart = true;
          this.cartRemove.next({...test, remove: true});
          this.cartAdd.next({...item, uuid: uuid()});
        }
      });
    });

    if (!this.alreadyInCart) {
      if (item.id === 38) {
        if (item.amount >= 1 && item.amount <= 19) {
          item.price_1_month = 4.5;
        } else if (item.amount >= 20 && item.amount <= 49) {
          item.price_1_month = 4;
        } else if (item.amount >= 50 && item.amount <= 99) {
          item.price_1_month = 3.5;
        } else if (item.amount >= 100 && item.amount <= 199) {
          item.price_1_month = 3;
        } else if (item.amount >= 200) {
          item.price_1_month = 2.5;
        }
      }

      this.cartAdd.next({...item, uuid: uuid()});
    }
  }

  public removeCartItem(item: CartItem): void {
    this.cartRemove.next({ ...item, remove: true });
  }

  public checkout(): void {
    this.checkoutTrigger.next(true);
  }

  private get cart(): Observable<CartItem[]> {
    return merge(this.cartAdd, this.cartRemove, this.DATA_ITEMS).pipe(
        startWith(this.DATA_ITEMS),
        scan((acc: CartItem[], item: CartItem) => {
          if (item) {
            if (item.remove) {
              return [...acc.filter(i => i.uuid !== item.uuid)];

            }
            return [...acc, item];
          }
        })
    );
  }

  private get total(): Observable<number> {
    return this.cart.pipe(
        map(items => {
          let total = 0;
          for (const i of items) {
            switch (i.purchaseLength) {
              case 1: {
                total += i.price_1_day * i.amount;
                break;
              }
              case 7: {
                total += i.price_1_week * i.amount;
                break;
              }
              case 31: {
                total += i.price_1_month * i.amount;
                break;
              }
              case -1: {
                total += i.price_eur * i.amount;
                break;
              }
              default: {
                break;
              }
            }
          }
          return total;
        })
    );
  }

  private getItems() {
    return of(this.DATA_ITEMS);
  }
}
