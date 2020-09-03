import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../shared/guards/auth.guard';
import { Role } from '../shared/models/role';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminScriptsComponent } from './admin-dashboard/admin-scripts/admin-scripts.component';
import { AdminUsersComponent } from './admin-dashboard/admin-users/admin-users.component';
import { AdminUsersDetailsComponent } from './admin-dashboard/admin-users/admin-users-details/admin-users-details.component';
import { AdminScriptsDetailsComponent } from './admin-dashboard/admin-scripts/admin-scripts-details/admin-scripts-details.component';


const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        data: {
            roles: [Role.ADMIN]
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: AdminDashboardComponent
            },
            {
                path: 'scripts',
                component: AdminScriptsComponent
            },
            {
                path: 'scripts/:script_name',
                component: AdminScriptsDetailsComponent
            },
            {
                path: 'users',
                component: AdminUsersComponent
            },
            {
                path: 'users/:username',
                component: AdminUsersDetailsComponent
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminDashboardRoutingModule { }
