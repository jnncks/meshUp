import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';

import { LogoutModalComponent } from './logout-modal.component';

import { ModalService } from '../../shared/modal.module';
import { AuthService } from '../../shared/auth.service';

import template from './menu-panel.component.html';
import styleUrl from './menu-panel.component.scss';

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

  constructor(
    private _modalService: ModalService
    ) {
      this.clicked = new EventEmitter();
  }

  ngOnInit() {
    this.visible = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.visible)
      this.visible = changes.visible.currentValue;
  }

  /**
   * Opens a confirmation modal to prevent accidental logout actions.
   */
  openLogoutModal(): void {
    this.clicked.emit('close');
    this._modalService.create(LogoutModalComponent)
  }
  
  onBlur(event) {
     // check whether the blur event has been emitted by clicking a related element
    if (event.relatedTarget)
      // don't close the menu
      return;

    // no related element has been clicked, close the menu
    this.clicked.emit('close');
  }
}
