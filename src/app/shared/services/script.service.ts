import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Script } from '../models/script';
import { Hwid } from '../models/hwid';
import { ScriptUsers } from '../models/script-users';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  constructor(public http: HttpClient) { }

  public newScript(addScriptFormData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.apiEndpoint}/developer/new_script.php`, addScriptFormData);
  }

  public updateScript(updateScriptFormData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.apiEndpoint}/developer/update_script.php`, updateScriptFormData);
  }

  public deleteScripts(deleteScriptFormData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.apiEndpoint}/developer/delete_script.php`, deleteScriptFormData);
  }

  public getScripts(): Observable<Script[]> {
    return this.http.get<Script[]>(`${environment.apiEndpoint}/developer/get_scripts.php`);
  }

  public getScriptDetails(scriptId: number): Observable<Script> {
    return this.http.get<Script>(`${environment.apiEndpoint}/script/get.php?scriptid=` + scriptId);
  }

  public getAllScripts(isAmber: boolean): Observable<Script[]> {
    if (isAmber) {
      return this.http.get<Script[]>(`${environment.apiEndpoint}/script/all.php?aurora=true`);
    } else {
      return this.http.get<Script[]>(`${environment.apiEndpoint}/script/all.php`);
    }
  }

  public getScriptUsers(scriptId: number): Observable<ScriptUsers[]> {
    return this.http.get<ScriptUsers[]>(`${environment.apiEndpoint}/script/users.php?scriptid=` + scriptId);
  }

  public getHwidByScript(scriptId: number): Observable<Hwid[]> {
    return this.http.get<Hwid[]>(`${environment.apiEndpoint}/developer/hwid/get_by_script.php?script_id=` + scriptId);
  }

  public getAuthModule(scriptId: number, callback: string): Observable<any> {
    return this.http.get(`${environment.apiEndpoint}/developer/lua/get_auth_module.php?sid=` + scriptId +
        `&callback=` +  callback, {responseType: 'arraybuffer'});
  }

  public getDevLoader(scriptId: number): Observable<ArrayBuffer> {
    return this.http.get(`${environment.apiEndpoint}/developer/lua/get_loader.php?sid=` + scriptId,
        {responseType: 'arraybuffer'});
  }

  public getTotalRevenue(scriptId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiEndpoint}/developer/get_revenue.php?script_id=` + scriptId);
  }

  set setCurrentScript(currentScript: number) {
    sessionStorage.setItem('selectedScript', String(currentScript));
  }

  get getCurrentScript(): number {
    return Number(sessionStorage.getItem('selectedScript'));
  }
}
