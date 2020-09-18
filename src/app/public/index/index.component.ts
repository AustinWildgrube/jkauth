import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Script } from '../../shared/models/script';

import { ScriptService } from '../../shared/services/script.service';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';

@UntilDestroy()
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
})
export class IndexComponent implements OnInit {
  newScriptsList: Array<Script>;
  scriptToAdd: Script;
  keyForm: FormGroup;

  hoveredIndex: number;
  negative: boolean;
  isHovered: boolean;
  isAuthenticated: boolean;

  constructor(private formBuilder: FormBuilder, private modalService: NgbModal, private scriptService: ScriptService,
              private cartService: CartService, private authService: AuthService) { }

  ngOnInit() {
    this.isHovered = false;
    this.negative = false;
    this.isAuthenticated = this.authService.userValue !== undefined;

    this.keyForm = this.formBuilder.group({
      keyAmount: [null, [Validators.required, Validators.minLength(1)]],
    });

    this.getNewScripts();
  }

  public openModal(content: TemplateRef<any>): void {
    this.keyForm.reset();
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
    } else {
      this.scriptToAdd.amount = 1;
    }

    if (this.scriptToAdd.amount > 0) {
      this.closeModal();
      this.cartService.addCartItem(this.scriptToAdd);
    } else {
      this.negative = true;
      this.scriptToAdd.amount = 0;
    }
  }

  public holdScriptToAdd(script: Script) {
    this.scriptToAdd = script;
  }

  private getNewScripts(): void {
    this.scriptService.getAllScripts().pipe(untilDestroyed(this)).subscribe(response => {
      response.sort((a, b) => b.id - a.id);
      this.newScriptsList = response;
    });
  }
}
