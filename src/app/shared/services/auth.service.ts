import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from '../../../environments/environment';
import { User } from '../models/user';

const helper = new JwtHelperService();

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    userObject: User;
    user: Observable<User>;
    useCookies: boolean;

    decodedToken: any;

    private userSubject: BehaviorSubject<User>;

    constructor(private router: Router, private http: HttpClient, private cookieService: CookieService) {
        this.checkCookieResponse();

        if (this.cookieService.check('auth_token')) {
            this.decodedToken = helper.decodeToken(this.cookieService.get('auth_token'));
            this.userObject = {
                id: this.decodedToken.uid,
                role: this.decodedToken.scopes,
                token: this.cookieService.get('auth_token')
            };
        }

        this.userSubject = new BehaviorSubject<User>(this.userObject);
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    public login(loginFormData: FormData): Observable<any> {
        return this.http.post(`${environment.apiEndpoint}/auth/login.php`, loginFormData, {responseType: 'text'})
            .pipe(map(user => {
                this.decodedToken = helper.decodeToken(user);
                this.userObject = {
                    id: this.decodedToken.uid,
                    role: this.decodedToken.scopes,
                    token: user
                };

                if (this.useCookies === true) {
                    this.cookieService.set('auth_token', user, .0416, '/', undefined, true);
                } else {
                    sessionStorage.setItem('auth_token', user);
                }

                this.userSubject.next(this.userObject);

                return user;
            })
        );
    }

    public register(registerFormData: FormData): Observable<any> {
        return this.http.post(`${environment.apiEndpoint}/auth/new.php`, registerFormData);
    }

    public logout(): void {
        if (this.useCookies === true) {
            this.cookieService.delete('auth_token');
        }

        this.userSubject.next(null);
        window.location.reload();
    }

    private checkCookieResponse(): void {
        this.useCookies = localStorage.getItem('jkcookies') === 'true';
    }
}
