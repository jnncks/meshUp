import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';

import { Modal } from './modal.module';
import { InfoNetService } from './info-net.service';
import { InfoNetMeta } from '../../../../both/models';

import template from './info-net-settings-modal.component.html';
import styleUrl from './info-net-settings-modal.component.scss';

@Component({
  selector: 'info-net-settings-modal',
  template,
  styles: [styleUrl],
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
@Modal()
export class InfoNetSettingsModal implements OnInit{
  // properties inherited from the ModalContainer
  destroy: Function;
  closeModal: Function;
  hidden: boolean;

  // custom properties
  @Input() infoNet: InfoNetMeta;
  modalTitle: string;
  infoNetForm: FormGroup;
  
  constructor(@Inject(FormBuilder) fb: FormBuilder, private _infoNetService: InfoNetService) {
    this.modalTitle = 'Informationsetz bearbeiten';

    // set up the form group
    this.infoNetForm = fb.group({
      name: ['', Validators.required],
      description: '',
      tags: ''
    });

    // TODO: collaborators
  }

  /**
   * Populates the input fields with the infoNetMeta data passed to the input.
   */
  ngOnInit() {
    this.infoNetForm.patchValue({
      name: this.infoNet.name,
      description: this.infoNet.description
    });

    if (this.infoNet.tags) {
      this.infoNetForm.patchValue({
        tags: this.infoNet.tags.join(', ')
      });
    }
    
    // TODO: collaborators
  }

  /**
   * Saves the form data if anything has changed and closes the modal.
   */
  save(): void {
    if (this.infoNetForm.dirty) {
      let infoNetUpdate: InfoNetMeta = {
        ...this.infoNet,
        name: this.infoNetForm.get('name').value.trim(),
        description: this.infoNetForm.get('description').value.trim(),
        tags: this.infoNetForm.get('tags').value.split(',')
                .map((tag) => tag.trim()),
        lastUpdated: new Date()
      }

      this._infoNetService.updateInfoNetMeta(infoNetUpdate);
    }

    this.closeModal();
  }

  /**
   * Closes the modal without saving the data, unless the form data has been
   * changed by the user. Leading and trailing whitespaces added by the user
   * are not taken into account.
   * 
   * Depending on the click source, the DOM Event should be passed to the
   * method to check whether the click originated from the backdrop or from
   * the actual modal itself.
   * 
   * @param  {Event} [event] The event for determining the click target.
   */
  cancel(event?: Event): void {
    if (event &&
      event.target['id'] === 'infoNetSettingsModal' &&
      this.infoNetForm.dirty) {
        let name = this.infoNetForm.get('name').value.trim();
        let description = this.infoNetForm.get('description').value.trim();
        let tags = this.infoNetForm.get('tags').value.trim();

        if (name != this.infoNet.name ||
          description != this.infoNet.description ||
          (!this.infoNet.tags && tags) ||
          (this.infoNet.tags && tags != this.infoNet.tags.join(', '))) {
            // at least one value differs from the original data and not only
            // by leading or trailing whitespaces, don't close the modal!
            return; // TODO: open a warning modal
      }
    } else if (event && event.target['id'] !== 'infoNetSettingsModal') {
      return; // a click from the modal itself, don't close the modal
    }

    this.closeModal();
  }
}