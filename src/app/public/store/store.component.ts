import { Component, OnInit } from '@angular/core';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Script } from '../../shared/models/script';

import { ScriptService } from '../../shared/services/script.service';
import { CartService } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';

@UntilDestroy()
@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
})
export class StoreComponent implements OnInit {
  newScriptsList: Array<Script>;

  hoveredIndex: number;
  searchTerm: string;
  isHovered: boolean;
  isAuthenticated: boolean;

  constructor(private scriptService: ScriptService, private cartService: CartService, private authService: AuthService) { }

  ngOnInit() {
    this.isHovered = false;
    this.isAuthenticated = this.authService.userValue !== undefined;

    this.getNewScripts();
  }

  public productHover(index: number, isHovered: boolean): void {
    this.hoveredIndex = index;
    this.isHovered = isHovered;
  }

  public addToCart(productId: number): void {
    this.cartService.addToCart(productId);
  }

  private getNewScripts(): void {
    this.scriptService.getAllScripts().pipe(untilDestroyed(this)).subscribe(response => {
      response.sort((a, b) => b.id - a.id);
      this.newScriptsList = response;
    });
  }
}
