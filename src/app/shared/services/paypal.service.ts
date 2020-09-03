import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  constructor(private http: HttpClient) { }

  // TODO: Type
  public createOrder(order: FormData): Observable<any> {
    return this.http.post<any>(`${environment.apiEndpoint}/payment/paypal/order.php`, order);
  }
}
