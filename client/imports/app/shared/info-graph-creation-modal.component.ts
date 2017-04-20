import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, FormControl, AbstractControl } from '@angular/forms';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/filter';

import { Modal } from './modal.module';
import { InfoGraphService } from './info-graph.service';
import { InfoGraphCategory, InfoGraphMeta, InfoGraph } from '../../../../both/models';

import template from './info-graph-creation-modal.component.html';
import styleUrl from './info-graph-creation-modal.component.scss';

/**
 * A modal which allows creating a new infoGraph.
 * 
 * @class InfoGraphCreationModalComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'info-graph-creation-modal',
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
export class InfoGraphCreationModalComponent implements OnInit{
  // properties inherited from the ModalContainer
  destroy: Function;
  closeModal: Function;
  hidden: boolean;
  selectedCategory: InfoGraphCategory;

  // custom properties
  @Input() categoryId: string;
  categories: Observable<InfoGraphCategory[]>
  modalTitle: string;
  infoGraphForm: FormGroup;
  nonEmptyString: RegExp = /(\w+\s*)+/;
  
  /**
   * Creates an instance of InfoGraphCreationModalComponent.
   * 
   * @constructor
   * @param  {FormBuilder} fb The FormBuilder.
   * @param  {InfoGraphService} _infoGraphService The InfoGraphService.
   */
  constructor(@Inject(FormBuilder) fb: FormBuilder,
    private _infoGraphService: InfoGraphService) {
      this.modalTitle = 'Neues Informationsetz erstellen';

      // set up the form group
      this.infoGraphForm = fb.group({
        name: [ '', Validators.compose([
            Validators.required,
            Validators.pattern(this.nonEmptyString)
          ]) ],
        description: '',
        category: [ '', Validators.required ],
        newCategory: '', // validators are set dynamically in ngOnInit()
        tags: ''
      });

      // TODO: collaborators
  }

  /**
   * Called when the component is initialized.
   * Gets all available infoGraphCategories and populates the selected
   * category with the category of the modal input after the component
   * has been instantiated.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
    this.categories = this._infoGraphService.getInfoGraphCategories();
    this.categories
      .map(categories => {
        return categories.filter(category => category._id === this.categoryId)
      })
      .subscribe(categories => {
        // categories is an array which contains a single element
        this.selectedCategory = categories[0]}
      );

    // Subscribe to value changes of the category select element to determine
    // on value changes whether the newCategory input needs to be validated.
    this.infoGraphForm.controls.category.valueChanges
      .subscribe(category => {
        if (category._id === 'NEW_CATEGORY') {
          // add the required validators
          this.infoGraphForm.controls.newCategory.setValidators(
            Validators.compose([
              Validators.required,
              Validators.pattern(this.nonEmptyString)
            ]));
        } else {
          // remove all validators
          this.infoGraphForm.controls.newCategory.setValidators(null);
          this.infoGraphForm.controls.newCategory.updateValueAndValidity();
        }
      })
  }

  /**
   * Stores the new infoGraph in the different collections:
   *   1. Creates a new category document if necessery.
   *   2. Creates the infoGraphMeta document.
   *   3. Creates the infoGraph document.
   * Subsequently, closes the modal and navigates (TODO!) to the graphView.
   * 
   * @method save
   */
  save(): void {
    let catId: Observable<string>;

    // determine whether a new category document must be created
    if (this.infoGraphForm.get('category').value._id === 'NEW_CATEGORY') {
      // create a new category document and pass an Observable of the ID to catId
      catId =  this._infoGraphService.createNewCategory({
        name: String(this.infoGraphForm.get('newCategory').value).trim(),
        description: '',
        owner: Meteor.userId()
      });
    } else {
      // pass an Observable of the ID of the existing category to catId
      catId =  Observable.of(this.infoGraphForm.get('category').value._id);
    }

    // pass the category's ID to the new infoGraphMeta document
    catId
      .concatMap((categoryId: string) => {
      // create a new infoGraphMeta and return an Observable of its ID
      return this._infoGraphService.createNewInfoGraphMeta({
        name: String(this.infoGraphForm.get('name').value).trim(),
        description: String(this.infoGraphForm.get('description').value).trim(),
        owner: Meteor.userId(),
        categoryId: categoryId,
        collaborators: [],
        tags: this.infoGraphForm.get('tags').value.split(',')
                .map((tag) => tag.trim()),
        created: new Date(),
        lastUpdated: new Date()
      });
    })

    // pass the infoGraphMeta's ID to the new infoGraph document
    .concatMap((metaId: string) => {
      // create a new infoGraph and return an Observable of its ID
      return this._infoGraphService.createNewInfoGraph({
        metaId: metaId
      });
    })
    .subscribe((graphId: string) => {
      // TODO: navigate to the graph view
    });
    
    this.closeModal();
  }

  /**
   * Closes the modal without saving the data, unless the form data has been
   * changed by the user.
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
      event.target['id'] === 'infoGraphCreationModal' &&
      this.infoGraphForm.dirty) {
        // TODO: open a warning modal and better checks
        return;
    } else if (event && event.target['id'] !== 'infoGraphCreationModal') {
      return; // a click from the modal itself, don't close the modal
    }

    this.closeModal();
  }
}