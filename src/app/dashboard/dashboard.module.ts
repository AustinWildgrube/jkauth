import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DevDashboardComponent } from './dev-dashboard/dev-dashboard.component';
import { DevScriptsComponent } from './dev-dashboard/dev-scripts/dev-scripts.component';
import { DevScriptsDetailsComponent } from './dev-dashboard/dev-scripts/dev-scripts-details/dev-scripts-details.component';
import { SharedModule } from '../shared/shared.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AdminScriptsComponent } from './admin-dashboard/admin-scripts/admin-scripts.component';
import { AdminUsersComponent } from './admin-dashboard/admin-users/admin-users.component';
import { AdminUsersDetailsComponent } from './admin-dashboard/admin-users/admin-users-details/admin-users-details.component';
import { AdminScriptsDetailsComponent } from './admin-dashboard/admin-scripts/admin-scripts-details/admin-scripts-details.component';
import { QuillModule } from 'ngx-quill';

@NgModule({
    declarations: [
        AdminDashboardComponent,
        DevDashboardComponent,
        DevScriptsComponent,
        DevScriptsDetailsComponent,
        AdminScriptsComponent,
        AdminUsersComponent,
        AdminUsersDetailsComponent,
        AdminScriptsDetailsComponent,
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        AdminDashboardRoutingModule,
        ReactiveFormsModule,
        SharedModule,
        FormsModule,
        BsDropdownModule.forRoot(),
        QuillModule.forRoot({
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{list: 'ordered'}, {list: 'bullet'}],
                    [{header: [1, 2, 3, 4, 5, 6, false]}],
                ]
            }
        })
    ],
    providers: [
        BsDropdownModule
    ]
})
export class DashboardModule { }
