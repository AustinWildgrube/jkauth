import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { JwtHelperService } from '@auth0/angular-jwt';
import { TemplatesModule } from './templates/templates.module';
import { SlugifyPipe } from './pipes/slugify.pipe';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
    declarations: [
        SlugifyPipe
    ],
    imports: [
        RouterModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        TemplatesModule,
        SweetAlert2Module
    ],
    exports: [
        ReactiveFormsModule,
        CommonModule,
        TemplatesModule,
        SlugifyPipe,
    ],
    providers: [
        JwtHelperService,
        SlugifyPipe
    ]
})
export class SharedModule { }
