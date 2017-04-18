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
    this.updateGraph();
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

    if (!this.graphData || !this.graphData.nodes || !this.graphData.nodes.length)
      return;

    let element = this._graphContainer.nativeElement;
    let g = d3.select(element).select('svg').select('g.graph');

    // draw the edges
    g.selectAll('.line')
      .data(this.graphData.edges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('x1', (d: Edge) => {
        let source: Node = this.graphData.nodes.filter((node: Node) => {
          return node._id === d.source;
        })[0];
        return source.x;
      })
      .attr('y1', (d: Edge) => {
        let source: Node = this.graphData.nodes.filter((node: Node) => {
          return node._id === d.source;
        })[0];
        return source.y;
      })
      .attr('x2', (d: Edge) => {
        let target: Node = this.graphData.nodes.filter((node: Node) => {
          return node._id === d.target;
        })[0];
        return target.x;
      })
      .attr('y2', (d: Edge) => {
        let target: Node = this.graphData.nodes.filter((node: Node) => {
          return node._id === d.target;
        })[0];
        return target.y;
      });
     
     // draw the nodes
     g.selectAll('circle .node')
      .data(this.graphData.nodes)
      .enter()
      .append('svg:circle')
      .attr('class', 'node')
      .attr('id', (d: Node) => d._id)
      .attr('cx', (d: Node) => d.x)
      .attr('cy', (d: Node) => d.y)
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
