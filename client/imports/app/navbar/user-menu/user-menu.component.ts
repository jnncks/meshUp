import { Component } from '@angular/core';

import template from './user-menu.component.html';
import style from './user-menu.component.scss';

@Component({
  selector: 'user-menu',
  template,
  styles: [ style ]
})
export class UserMenuComponent {
  toggleState: boolean;

  constructor() {
    this.toggleState = false;
  }

  togglePanel() {
    this.toggleState = !this.toggleState;
  }

  handleItemClick(event) {
    if(event === 'close')
      this.toggleState = false;
  }

  onBlur(event) {
     // check whether the blur event has been emitted by clicking a child element
    if (event.relatedTarget)
      // don't close the menu
      return;

    // no child element has been clicked, close the menu
    this.toggleState = false;
  }
}
