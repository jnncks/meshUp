import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/operator/debounceTime';

import { Modal } from './modal.module';

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
  destroy: Function;
  closeModal: Function;
  hidden: boolean;
  @Input() infoNet: InfoNetMeta;
  modalTitle: string;
  infoNetForm: FormGroup;

  
  constructor(@Inject(FormBuilder) fb: FormBuilder) {
    this.modalTitle = 'Informationsetz bearbeiten';
    this.infoNetForm = fb.group({
      name: ['', Validators.required],
      description: '',
      tags: ''
    });

    // TODO: collaborators
  }

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
      
    //this.collaborators = this.infoNetInput.collaborators
  }

  save() {
    this.closeModal();
    this.destroy();
  }

  cancel(event): void {
    if (event && event.srcElement.id === 'infoNetSettingsModal' && this.infoNetForm.dirty) {
      let name = this.infoNetForm.get('name').value.trim();
      let description = this.infoNetForm.get('description').value.trim();
      let tags = this.infoNetForm.get('tags').value.trim();

      if (name != this.infoNet.name || description != this.infoNet.description || tags != this.infoNet.tags.join(', ')) {
        //  >= 1 values differ from the original data, don't close the modal
        return; // TODO: open a warning modal
      }
    } else if (event && event.srcElement.id !== 'infoNetSettingsModal') {
      return; // a click from the modal itself, don't close the modal
    }

    this.closeModal();
  }
}