import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { HeaderComponent } from './header/header.component';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';
import { FooterComponent } from './footer/footer.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { CookieMessageComponent } from './cookie-message/cookie-message/cookie-message.component';

@NgModule({
  declarations: [
      HeaderComponent,
      DashboardHeaderComponent,
      FooterComponent,
      SidenavComponent,
      CookieMessageComponent
  ],
    exports: [
        HeaderComponent,
        DashboardHeaderComponent,
        FooterComponent,
        SidenavComponent,
        CookieMessageComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        BsDropdownModule
    ]
})
export class TemplatesModule { }
