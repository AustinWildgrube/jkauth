import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { AdminUser } from '../models/admin-user';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(public http: HttpClient) { }

    public getHwidByUser(userId: number): Observable<any> {
        return this.http.get<any>(`${environment.apiEndpoint}/developer/hwid/get_by_user.php?user_id=` + userId);
    }

    public getAllUsers(): Observable<AdminUser[]> {
        return this.http.get<AdminUser[]>(`${environment.apiEndpoint}/user/all.php`);
    }

    public getScripts(userid: number): Observable<any> {
        return this.http.get<any>(`${environment.apiEndpoint}/script/get.php?authorname=` + userid);
    }

    public getSelf(): Observable<any> {
        return this.http.get<any>(`${environment.apiEndpoint}/user/self.php`);
    }

    public getSelfPurchases(): Observable<any> {
        return this.http.get(`${environment.apiEndpoint}/user/payments/self.php`);
    }

    public getSelfAuths(): Observable<any> {
        return this.http.get(`${environment.apiEndpoint}/user/auths/self.php`);
    }

    public getKeygenFile(): Observable<any> {
        return this.http.get(`${environment.apiEndpoint}/user/keyfile/get_keyfile.php`);
    }

    public updateHanbotId(hanbotFormData: FormData): Observable<any> {
        return this.http.post(`${environment.apiEndpoint}/user/update.php`, hanbotFormData);
    }
}
