import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { JwtHelperService } from '@auth0/angular-jwt';
import { TemplatesModule } from './templates/templates.module';
import { SlugifyPipe } from './pipes/slugify.pipe';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { QuillModule } from 'ngx-quill';
import { SafePipe } from './pipes/safe.pipe';

@NgModule({
    declarations: [
        SlugifyPipe,
        SafePipe
    ],
    imports: [
        RouterModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        TemplatesModule,
        SweetAlert2Module,
        QuillModule.forRoot()
    ],
    exports: [
        ReactiveFormsModule,
        CommonModule,
        TemplatesModule,
        SlugifyPipe,
        SafePipe,
    ],
    providers: [
        JwtHelperService,
        SlugifyPipe
    ]
})
export class SharedModule { }
