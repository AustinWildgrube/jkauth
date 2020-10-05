import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { ResellerKeys } from '../models/reseller-keys';

@Injectable({
  providedIn: 'root'
})
export class ResellerService {

  constructor(private http: HttpClient) { }

  public getResellerKeys(): Observable<ResellerKeys[]> {
    return this.http.get<ResellerKeys[]>(`${environment.apiEndpoint}/reseller/get_keys.php`);
  }

  public redeemResellerKey(key: string): Observable<string> {
    return this.http.get<string>(`${environment.apiEndpoint}/reseller/redeem_key.php?key=` + key);
  }
}
