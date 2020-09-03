import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from '../shared/guards/auth.guard';

import {IndexComponent} from './index/index.component';
import {StoreComponent} from './store/store.component';
import {CheckoutComponent} from './checkout/checkout.component';
import {AccountComponent} from './account/account.component';
import {Role} from "../shared/models/role";


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: IndexComponent
      },
      {
        path: 'account',
        component: AccountComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [Role.USER, Role.DEVELOPER, Role.ADMIN]
        },
      },
      {
        path: 'shop',
        component: StoreComponent
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [Role.USER, Role.DEVELOPER, Role.ADMIN]
        },
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
