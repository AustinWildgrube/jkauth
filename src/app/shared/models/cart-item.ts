export interface CartItem {
    uuid?: any;
    remove?: boolean;
    author: number;
    id: number;
    image: string;
    sname: string;
    lua: string;
    price_1_day: number;
    price_1_week: number;
    price_1_month: number;
    price_eur: number;
    trial_time: number;
    name?: string;
    amount?: number;
    purchaseLength?: number;
}
