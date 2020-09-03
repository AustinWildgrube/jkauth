import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { PublicRoutingModule } from './public-routing.module';
import { SharedModule } from '../shared/shared.module';
import { StoreComponent } from './store/store.component';
import { IndexComponent } from './index/index.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AccountComponent } from './account/account.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    StoreComponent,
    IndexComponent,
    CheckoutComponent,
    AccountComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PublicRoutingModule,
    Ng2SearchPipeModule,
    FormsModule
  ]
})
export class PublicModule { }
