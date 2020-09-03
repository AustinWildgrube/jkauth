export class UserPayments {
    id: number;
    user_id: number;
    script_id: number;
    funds_received_usd: number;
    current_status: string;
    coinpayments_raw_status: number;
    last_update: Date;
    sname?: string;
}
