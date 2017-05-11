import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import * as d3 from 'd3';

import {
  Edge,
  InfoGraph,
  Node
} from '../../../../both/models';

import styleUrl from './minimap.component.scss';
import template from './minimap.component.html';

/**
 * Displays a mini map of the graphData input.
 * 
 * @class MiniMapComponent
 * @implements {AfterViewInit}
 * @implements {OnChanges}
 */
@Component({
  selector: 'minimap',
  template,
  styles: [styleUrl],
  encapsulation: ViewEncapsulation.None
})
export class MiniMapComponent implements AfterViewInit, OnChanges {
  @ViewChild('miniMapContainer') private _miniMapContainer: ElementRef;
  @Input() graphData: InfoGraph;

  constructor() {
  }

  ngAfterViewInit() {
    this.initMiniMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.graphData) {
      // TODO
    }
  }

  initMiniMap(): void {
    // TODO
  }
}