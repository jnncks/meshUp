import { Component, Input } from '@angular/core';

import template from './user-menu.component.html';
import styleUrl from './user-menu.component.scss';

/**
 * Serves as a container for the ProfileButtonComponent
 * and the MenuPanelComponent.
 * 
 * @class UserMenuComponent
 */
@Component({
  selector: 'user-menu',
  template,
  styles: [ styleUrl ]
})
export class UserMenuComponent {
  @Input() visible: boolean;
  toggleState: boolean;

  /**
   * Creates an instance of the UserMenuComponent.
   * 
   * @constructor
   */
  constructor() {
    this.toggleState = false;
  }

  /**
   * Toggles the MenuPanel's visibility.
   * 
   * @method togglePanel
   */
  togglePanel(): void {
    this.toggleState = !this.toggleState;
  }

  /**
   * Handles clicks on the MenuPanel's items.
   * 
   * @method handleItemClick
   * @param {Event} event 
   */
  handleItemClick(event: Event): void {
    if (event.type === 'close')
      this.toggleState = false;
  }

  /**
   * Closes the menu if the user clicked somewhere outside of the menu.
   * 
   * @method onBlur
   * @param {Event} event 
   */
  onBlur(event: Event): void {
     // check whether the blur event has been emitted by clicking a child element
    if (event && event.srcElement && event.srcElement.classList[0] === 'user-menu') {
      // don't close the menu
      return;
    }
    // no child element has been clicked, close the menu
    this.toggleState = false;
  }
}
