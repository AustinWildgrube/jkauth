import { CartItem } from './cart-item';

export interface StateTree {
    store: CartItem[];
    cart: CartItem[];
    total: number;
    checkout: boolean;
}
