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

/**
 * Displays the graph via D3.js as a SVG group with both nodes and edges
 * and allows different interactions with it.
 * 
 * The graph data is passed through the graphData input to the component.
 * 
 * @class GraphComponent
 * @implements {AfterViewInit}
 * @implements {OnChanges}
 */
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
  private _scale: d3.ZoomBehavior<SVGGElement, any>;

  /**
   * Creates an instance of the GraphComponent.
   * 
   * @constructor
   */
  constructor() {
  }

/**
 * Called after the view has been initialized.
 * Prepares the SVG element.
 * 
 * Note: This is important! The ViewChild _graphContainer can't be accessed
 *       prior to this event. Therefore, this is the earliest point in time
 *       where we can append our SVG element to the _graphContainer.
 * 
 * @method ngAfterViewInit
 */
  ngAfterViewInit(): void {
    this.initGraph();

    if (this.graphData) {
      this.updateGraph(true);
    }

    // handle window resize events
    Observable.fromEvent(window, 'resize')
      .debounceTime(50) // debounce for 50ms
      .subscribe(() => this.handleWindowResize());
  }

  /**
   * Handles input changes:
   * Currently, it only triggers an update of the graphData.
   * 
   * @method ngOnChanges
   * @param  {SimpleChanges} changes An event of changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.updateGraph();
  }

  /**
   * Initializes the graph.
   * Appends a SVG element to the graphContainer and
   * sets the height and width of the element.
   * 
   * @method initGraph
   */
  initGraph(): void {
    let element = this._graphContainer.nativeElement;
    this._width = element.offsetWidth;
    this._height = element.offsetHeight;

    let svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    this._graph = svg.append('g')
      .attr('class', 'graph');

    // set up the zoom behavior on the svg element
    this._scale = d3.zoom()
        .scaleExtent([0.1, 5])
        .on('zoom', () => this.handleZoom());

    svg.call(this._scale);

    // somehow d3.zoom() does also dragging
    // svg.call(
    //   d3.drag()
    //     .on('drag', () => this.handleDrag())
    // );

  }

  /**
   * Updates the graph:
   * Appends new nodes and edges or updates properties of existing nodes.
   * 
   * @method updateGraph
   * @param  {boolean} centerGraph Whether the graph should be centered.
   */
  updateGraph(centerGraph: boolean = false): void {

    if (!this.graphData || !this.graphData.nodes || !this.graphData.nodes.length)
      return;

    let element = this._graphContainer.nativeElement;
    let svg = d3.select(element).select<SVGElement>('svg');
    let g = svg.select<SVGGElement>('g.graph');

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

    if (centerGraph) {
      this.fitContainer();
    }
  }

  /**
   * Transforms the graph so that it fits the container.
   * 
   * @method fitContainer
   */
  fitContainer(): void {
    let element = this._graphContainer.nativeElement;
    let svg = d3.select(element).select<SVGElement>('svg');
    let g = svg.select<SVGGElement>('g.graph');

    // reset the transformation
    svg.call(this._scale.transform, d3.zoomIdentity)

    // get boundaries of the container and the graph group
    let containerWidth = element.offsetWidth;
    let containerHeight = element.offsetHeight;
    let bbox = g.node().getBBox();

    // calculate the scale
    const padding = 0.05; // 5 percent
    let scale = (1 - padding) * Math.min(
      containerWidth / bbox.width,
      containerHeight/ bbox.height
    );

    // calculate the x and y offsets to center the graph
    let widthOffset =
      (containerWidth - bbox.width * scale)/2 - bbox.x * scale;
    let heightOffset =
      (containerHeight - bbox.height * scale)/2 - bbox.y * scale;

    // put everything together and emit the event
    let t: d3.ZoomTransform = d3.zoomIdentity
      .translate(widthOffset, heightOffset).scale(scale);

    svg.call(this._scale.transform, t);
  }

  /**
   * Resizes the SVG element when the window has been resized.
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
    if (!d3.event  || !d3.event.transform)
      return;

    let element: HTMLDivElement = this._graphContainer.nativeElement;
    let containerWidth = element.offsetWidth;
    let containerHeight = element.offsetHeight;

    // our properly typed SVG elements
    let svg = d3.select(element).select<SVGElement>('svg');
    let g = svg.select<SVGGElement>('g.graph');

    // the bounding box of the graph group
    let bbox = g.node().getBBox();

    // the requested transformation (t) and scale (s)
    let t = d3.event.transform;
    let s = t.k;

    // calculate the transformation so that the graph stays in the view
    t.x = Math.max(
            (-bbox.x * s - bbox.width * s + bbox.width / 3 * Math.sqrt(s)),
            Math.min(t.x, containerWidth - bbox.width / 3 * Math.sqrt(s)));
    t.y = Math.max(
            (-bbox.y * s - bbox.height * s + bbox.height / 3 * Math.sqrt(s)),
            Math.min(t.y, containerHeight - bbox.height / 3 * Math.sqrt(s)));
      
    // update the transform attribute of the SVG graph group
    g.attr('transform', t);
  }

  // TODO: unused!
  /**
   * Handles drag callbacks... .
   * 
   * @method handleDrag
   */
  handleDrag = () => {
    let svg = d3.select(this._graphContainer.nativeElement)
                .select('svg')
                .select('g.graph');
    // TODO: this is wrong and should target single nodes!
    svg.attr('cx', d3.event.x)
       .attr('cy', d3.event.y);
  }
}
