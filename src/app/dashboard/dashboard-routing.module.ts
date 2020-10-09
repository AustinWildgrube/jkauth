import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../shared/guards/auth.guard';
import { Role } from '../shared/models/role';

import { DevDashboardComponent } from './dev-dashboard/dev-dashboard.component';
import { DevScriptsComponent } from './dev-dashboard/dev-scripts/dev-scripts.component';
import { DevScriptsDetailsComponent } from './dev-dashboard/dev-scripts/dev-scripts-details/dev-scripts-details.component';
import { DevScriptsSalesComponent } from './dev-dashboard/dev-scripts/dev-scripts-sales/dev-scripts-sales.component';


const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: {
      roles: [Role.DEVELOPER]
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DevDashboardComponent,
      },
      {
        path: 'scripts/:script_name/sales',
        component: DevScriptsSalesComponent,
      },
      {
        path: 'scripts/:script_name',
        component: DevScriptsDetailsComponent,
      },
      {
        path: 'scripts',
        component: DevScriptsComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
