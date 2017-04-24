import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';

import { LogoutModalComponent } from './logout-modal.component';

import { ModalService } from '../../shared/modal.module';
import { AuthService } from '../../shared/auth.service';

import template from './menu-panel.component.html';
import styleUrl from './menu-panel.component.scss';

/**
 * Contains the menu items of the user menu.
 * 
 * @class MenuPanelComponent
 * @implements {OnInit}
 * @implements {OnChanges}
 */
@Component({
  selector: 'menu-panel',
  template,
  styles: [ styleUrl ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        animate('0.125s ease', keyframes([
          style({opacity: 0}),
          style({opacity: 1})
        ]))
      ]),
      transition(':leave', [
        animate('0.125s ease', keyframes([
          style({opacity: 1}),
          style({opacity: 0})
        ]))
      ])
    ])
  ]
})
export class MenuPanelComponent implements OnInit, OnChanges{
  @Input() visible: boolean;
  @Output() clicked: EventEmitter<any>;

  /**
   * Creates an instance of the MenuPanelComponent.
   * 
   * @constructor
   * @param {ModalService} _modalService The ModalService.
   */
  constructor(private _modalService: ModalService) {
    this.clicked = new EventEmitter();
  }

  /**
   * Called when the component is initialized.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
    this.visible = false;
  }

  /**
   * Handles input changes.
   * 
   * @method ngOnChanges
   * @param  {SimpleChanges} changes An event of changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.visible)
      this.visible = changes.visible.currentValue;
  }

  /**
   * Opens a confirmation modal to prevent accidental logout actions.
   * 
   * @method openLogoutModal
   */
  openLogoutModal(): void {
    this.clicked.emit({type: 'close'});
    this._modalService.create(LogoutModalComponent)
  }

  /**
   * Closes the menu if the user clicked somewhere outside of the menu.
   * 
   * @method onBlur
   * @param {Event} event 
   */
  onBlur(event: Event): void {
     // check whether the blur event has been emitted by clicking a related element
    if (event && event.target && event.target['id'])
      // don't close the menu
      return;

    // no related element has been clicked, close the menu
    this.clicked.emit({type: 'close'});
  }
}
