import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Script } from '../../shared/models/script';
import { ScriptService } from '../../shared/services/script.service';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';

import Swal from 'sweetalert2';

@UntilDestroy()
@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
})
export class StoreComponent implements OnInit {
  newScriptsList: Array<Script>;
  scriptToAdd: Script;
  keyForm: FormGroup;

  hoveredIndex: number;
  searchTerm: string;
  negative: boolean;
  isHovered: boolean;
  isAuthenticated: boolean;
  isLoaded: boolean;

  constructor(private formBuilder: FormBuilder, private modalService: NgbModal, private router: Router,
              private scriptService: ScriptService, private cartService: CartService,
              private authService: AuthService) { }

  ngOnInit() {
    this.isLoaded = false;
    this.isHovered = false;
    this.negative = false;
    this.isAuthenticated = this.authService.userValue !== undefined;

    this.keyForm = this.formBuilder.group({
      keyAmount: [null, [Validators.required, Validators.minLength(1)]],
      keyLength: [null, [Validators.required]]
    });

    this.getNewScripts();
  }

  public openModal(content: TemplateRef<any>): void {
    this.keyForm.reset();
    this.keyForm.get('keyAmount').setValue(1);
    this.modalService.open(content, { centered: true });
  }

  public closeModal(): void {
    this.modalService.dismissAll();
  }

  public productHover(index: number, isHovered: boolean): void {
    this.hoveredIndex = index;
    this.isHovered = isHovered;
  }

  public addToCart(isBulk: boolean): void {
    if (isBulk) {
      this.scriptToAdd.amount = this.keyForm.get('keyAmount').value;
      this.scriptToAdd.purchaseLength = +this.keyForm.get('keyLength').value;
    } else {
      this.scriptToAdd.amount = 1;
      this.scriptToAdd.purchaseLength = 1;
    }

    if (this.scriptToAdd.amount > 0) {
      this.closeModal();
      this.cartService.addCartItem(this.scriptToAdd);
    } else {
      this.negative = true;

      if (this.scriptToAdd.price_1_day !== -1) {
        this.scriptToAdd.purchaseLength = 1;
      } else if (this.scriptToAdd.price_1_week !== -1) {
        this.scriptToAdd.purchaseLength = 7;
      } else if (this.scriptToAdd.price_1_month !== -1) {
        this.scriptToAdd.purchaseLength = 31;
      } else if (this.scriptToAdd.price_eur !== 9999999) {
        this.scriptToAdd.purchaseLength = -1;
      }
    }
  }

  public holdScriptToAdd(script: Script) {
    this.scriptToAdd = script;
  }

  public loginPrompt(): void {
    Swal.fire({
      title: 'Please Login First',
      text: 'You must be logged in to purchase a product',
      showCancelButton: true,
      confirmButtonText: 'Login!'
    }).then((result) => {
      if (result.value) {
        this.router.navigate(['/authentication/login']);
      }
    });
  }

  private getNewScripts(): void {
    this.scriptService.getAllScripts().pipe(untilDestroyed(this)).subscribe(response => {
      response.sort((a, b) => b.id - a.id);
      this.newScriptsList = response;
      this.isLoaded = true;
    });
  }
}
