import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
  currentDate: number;

  constructor() { }

  ngOnInit(): void {
    this.currentDate = new Date().getFullYear();
  }

}
