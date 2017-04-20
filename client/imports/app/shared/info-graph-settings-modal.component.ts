import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';

import { Modal } from './modal.module';
import { InfoGraphService } from './info-graph.service';
import { InfoGraphMeta } from '../../../../both/models';

import template from './info-graph-settings-modal.component.html';
import styleUrl from './info-graph-settings-modal.component.scss';

/**
 * A modal which allows updating the settings of a infoGraph.
 * 
 * @class InfoGraphSettingsModalComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'info-graph-settings-modal',
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
export class InfoGraphSettingsModalComponent implements OnInit{
  // properties inherited from the ModalContainer
  destroy: Function;
  closeModal: Function;
  hidden: boolean;

  // custom properties
  @Input() infoGraph: InfoGraphMeta;
  modalTitle: string;
  infoGraphForm: FormGroup;
  
  /**
   * Creates an instance of the InfoGraphSettingsModalComponent.
   * Initializes the form group.
   * 
   * @constructor
   * @param {FormBuilder} fb The FormBuilder.
   * @param {InfoGraphService} _infoGraphService The InfoGraphService.
   */
  constructor(@Inject(FormBuilder) fb: FormBuilder, private _infoGraphService: InfoGraphService) {
    this.modalTitle = 'Informationsetz bearbeiten';

    // set up the form group
    this.infoGraphForm = fb.group({
      name: ['', Validators.required],
      description: '',
      tags: ''
    });

    // TODO: collaborators
  }

  /**
   * Called when the component is initialized.
   * Populates the input fields with the infoGraphMeta data passed to the input.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
    this.infoGraphForm.patchValue({
      name: this.infoGraph.name,
      description: this.infoGraph.description
    });

    if (this.infoGraph.tags) {
      this.infoGraphForm.patchValue({
        tags: this.infoGraph.tags.join(', ')
      });
    }
    
    // TODO: collaborators
  }

  /**
   * Saves the form data if anything has changed and closes the modal.
   * 
   * @method save
   */
  save(): void {
    if (this.infoGraphForm.dirty) {
      let infoGraphUpdate: InfoGraphMeta = {
        ...this.infoGraph,
        name: this.infoGraphForm.get('name').value.trim(),
        description: this.infoGraphForm.get('description').value.trim(),
        tags: this.infoGraphForm.get('tags').value.split(',')
                .map((tag) => tag.trim()),
        lastUpdated: new Date()
      }

      this._infoGraphService.updateInfoGraphMeta(infoGraphUpdate);
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
   * @method cancel
   * @param  {Event} [event] The event for determining the click target.
   */
  cancel(event?: Event): void {
    if (event &&
      event.target['id'] === 'infoGraphSettingsModal' &&
      this.infoGraphForm.dirty) {
        let name = this.infoGraphForm.get('name').value.trim();
        let description = this.infoGraphForm.get('description').value.trim();
        let tags = this.infoGraphForm.get('tags').value.trim();

        if (name != this.infoGraph.name ||
          description != this.infoGraph.description ||
          (!this.infoGraph.tags && tags) ||
          (this.infoGraph.tags && tags != this.infoGraph.tags.join(', '))) {
            // at least one value differs from the original data and not only
            // by leading or trailing whitespaces, don't close the modal!
            return; // TODO: open a warning modal
      }
    } else if (event && event.target['id'] !== 'infoGraphSettingsModal') {
      return; // a click from the modal itself, don't close the modal
    }

    this.closeModal();
  }
}