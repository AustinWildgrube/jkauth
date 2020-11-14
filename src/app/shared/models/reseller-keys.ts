export interface ResellerKeys {
    id: number;
    key: string;
    redeemed_by: number;
    reseller_id: number;
    script_id: number;
    key_duration: number;
    creation_timestamp: Date;
    use_timestamp: Date;
    redeemed_by_name?: string;
}
