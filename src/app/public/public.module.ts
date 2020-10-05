import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxPaginationModule } from 'ngx-pagination';

import { PublicRoutingModule } from './public-routing.module';
import { SharedModule } from '../shared/shared.module';
import { StoreComponent } from './store/store.component';
import { IndexComponent } from './index/index.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AccountComponent } from './account/account.component';
import { ResellerKeysComponent } from './reseller-keys/reseller-keys.component';
import { ResellerDetailsComponent } from './reseller-keys/reseller-details/reseller-details.component';


@NgModule({
    declarations: [
        StoreComponent,
        IndexComponent,
        CheckoutComponent,
        AccountComponent,
        ResellerKeysComponent,
        ResellerDetailsComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        PublicRoutingModule,
        Ng2SearchPipeModule,
        FormsModule,
        NgxSkeletonLoaderModule,
        NgxPaginationModule
    ]
})
export class PublicModule { }
