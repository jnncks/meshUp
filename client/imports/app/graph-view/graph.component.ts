import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Observable } from 'rxjs';
import * as d3 from 'd3';

import { Edge, InfoGraph, Node } from '../../../../both/models';

import styleUrl from './graph.component.scss';
import template from './graph.component.html';

@Component({
  selector: 'meshup-graph',
  template,
  styles: [ styleUrl ],
  encapsulation: ViewEncapsulation.None
})
export class GraphComponent implements AfterViewInit, OnChanges {
  @ViewChild('graphContainer') private _graphContainer: ElementRef;
  @Input() graphData: InfoGraph;
  private _graph: any;
  private _width: number;
  private _height: number;
  //private _scale: number;
  //private _center: {x: number, y: number};
  private _testNodes: Node[];
  private _testEdges: Edge[];

  constructor() {
    this._testNodes = [
      { _id: '1', x: 100, y: 100, title: 'test0', content: '', created: new Date(), lastUpdated: new Date() },
      { _id: '2', x: 930, y: 102, title: 'test1', content: '', created: new Date(), lastUpdated: new Date() },
      { _id: '3', x: 1200, y: 849, title: 'test2', content: '', created: new Date(), lastUpdated: new Date() },
      { _id: '4', x: 293, y: 467, title: 'test3', content: '', created: new Date(), lastUpdated: new Date() },
      { _id: '5', x: 945, y: 586, title: 'tes4t', content: '', created: new Date(), lastUpdated: new Date() },
      { _id: '6', x: 396, y: 298, title: 'test5', content: '', created: new Date(), lastUpdated: new Date() },
      { _id: '7', x: 869, y: 1293, title: 'test6', content: '', created: new Date(), lastUpdated: new Date() },
      { _id: '8', x: 764, y: 231, title: 'test7', content: '', created: new Date(), lastUpdated: new Date() },
      { _id: '9', x: 1293, y: 1053, title: 'test8', content: '', created: new Date(), lastUpdated: new Date() },
      { _id: '10', x: 1409, y: 434, title: 'test9', content: '', created: new Date(), lastUpdated: new Date() },
      { _id: '11', x: 678, y: 874, title: 'test10', content: '', created: new Date(), lastUpdated: new Date() }
    ];

    this._testEdges = [
      { source: '1', target: '6', created: new Date() },
      { source: '1', target: '9', created: new Date() },
      { source: '2', target: '3', created: new Date() },
      { source: '6', target: '2', created: new Date() },
      { source: '7', target: '8', created: new Date() },
      { source: '10', target: '1', created: new Date() },
      { source: '11', target: '4', created: new Date() },
      { source: '5', target: '8', created: new Date() },
      { source: '9', target: '10', created: new Date() },
      { source: '10', target: '3', created: new Date() },
      { source: '11', target: '6', created: new Date() },
      { source: '7', target: '4', created: new Date() },
    ];
  }

  ngAfterViewInit() {
    this.initGraph();

    if (this.graphData) {
      this.updateGraph();
    }

    // handle window resize events
    Observable.fromEvent(window, 'resize')
      .debounceTime(50) // debounce for 50ms
      .subscribe(() => this.handleWindowResize());
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)

    // TODO: handle Input changes to update the graph
  }

  /**
   * Initializes the graph.
   * Appends a SVG element to the graphContainer and
   * sets the height and width of the element.
   * 
   * @method initGraph
   */
  initGraph() {
    let element = this._graphContainer.nativeElement;
    this._width = element.offsetWidth;
    this._height = element.offsetHeight;

    let svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    this._graph = svg.append('g')
      .attr('class', 'graph');

    // set up the zoom behavior on the svg element
    svg.call(
      d3.zoom()
        .scaleExtent([0.05, 5])
        .on('zoom', () => this.handleZoom())
    );

    svg.call(
      d3.drag()
        .on('drag', () => this.handleDrag())
    );

  }

  /**
   * Updates the graph:
   * Appends new nodes and edges or updates properties of existing nodes.
   * 
   * @method updateGraph
   */
  updateGraph(): void {
    let element = this._graphContainer.nativeElement;
    let g = d3.select(element).select('svg').select('g.graph');

    // draw the edges
    g.selectAll('.line')
      .data(this._testEdges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('x1', d => Number(this._testNodes[Number(d.source) - 1].x))
      .attr('y1', d => Number(this._testNodes[Number(d.source) - 1].y))
      .attr('x2', d => Number(this._testNodes[Number(d.target) - 1].x))
      .attr('y2', d => Number(this._testNodes[Number(d.target) - 1].y));
     
     // draw the nodes
     g.selectAll('circle .node')
      .data(this._testNodes)
      .enter()
      .append('svg:circle')
      .attr('class', 'node')
      .attr('id', d => String(d._id))
      .attr('cx', d => Number(d.x))
      .attr('cy', d => Number(d.y))
      .attr('r', '75px');
  }

  /**
   * Resizes the svg when the window has been resized.
   * 
   * @method handleWindowResize
   */
  handleWindowResize(): void {
    let element = this._graphContainer.nativeElement;
    this._width = element.offsetWidth;
    this._height = element.offsetHeight;

    d3.select(element)
      .select('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);
  }

  /**
   * Handles zoom callbacks: transforms the graph group ('g.graph').
   * 
   * @method handleZoom
   */
  handleZoom = () => {
    let svg = d3.select(this._graphContainer.nativeElement)
                .select('svg')
                .select('g.graph');
    let transform = d3.event.transform;
    svg.attr('transform', transform);
  }

  /**
   * Handles drag callbacks: translates the graph group ('g.graph').
   * 
   * @method handleDrag
   */
  handleDrag = () => {
    let svg = d3.select(this._graphContainer.nativeElement)
                .select('svg')
                .select('g.graph');
    svg.attr('cx', d3.event.x)
       .attr('cy', d3.event.y);
  }
}
