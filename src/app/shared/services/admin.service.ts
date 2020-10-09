import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { UserPayments } from '../models/user-payments';
import { Hwid } from '../models/hwid';
import { AdminUser } from '../models/admin-user';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    selectedUserId: number;

    constructor(public http: HttpClient) { }

    public set setSelectedUserId(userId: number) {
        this.selectedUserId = userId;
    }

    public get getSelectedUserId(): number {
        return this.selectedUserId;
    }

    public getUserPurchases(userId: number): Observable<UserPayments[]> {
        return this.http.get<UserPayments[]>(`${environment.apiEndpoint}/user/payments/get.php?id=` + userId);
    }

    public getUserHwid(userId: number): Observable<Hwid[]> {
        return this.http.get<Hwid[]>(`${environment.apiEndpoint}/user/hwid/get.php?id=` + userId);
    }

    public getUserDetails(userId: number): Observable<AdminUser[]> {
        return this.http.get<AdminUser[]>(`${environment.apiEndpoint}/user/get.php?userid=` + userId);
    }

    // TODO: Model
    public disableUser(userId: number): Observable<any> {
        return this.http.get<any>(`${environment.apiEndpoint}/user/admin/disable.php?id=` + userId);
    }

    // TODO: Model
    public banUser(userId: number): Observable<any> {
        return this.http.get<any>(`${environment.apiEndpoint}/user/admin/ban.php?id=` + userId);
    }

    // TODO: Model
    public promoteUser(userId: number, rank: string): Observable<any> {
        return this.http.get<any>(`${environment.apiEndpoint}/user/admin/promote.php?id=` + userId + `&rank=` + rank);
    }

    public getDeveloperSales(scriptId: number): Observable<UserPayments[]> {
        return this.http.get<UserPayments[]>(`${environment.apiEndpoint}/developer/get_sales.php?script_id=` + scriptId);
    }
}
