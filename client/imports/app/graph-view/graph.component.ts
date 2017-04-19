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
  private _scale: d3.ZoomBehavior<SVGGElement, any>;
  //private _center: {x: number, y: number};
  private _testNodes: Node[];
  private _testEdges: Edge[];

  constructor() {
  }

  ngAfterViewInit() {
    this.initGraph();

    if (this.graphData) {
      this.updateGraph(true);
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
    this._scale = d3.zoom()
        .scaleExtent([0.05, 5])
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
   * @param  {boolean} centerDrawing Whether the drawing should be centered.
   */
  updateGraph(centerDrawing: boolean = false): void {

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

    if (centerDrawing) {
      this.fitContainer();
    }
  }

  /**
   * Transforms the graph so that it fits the container.
   * 
   * @method fitContainer
   */
  fitContainer() {
    let element = this._graphContainer.nativeElement;
    let svg = d3.select(element).select<SVGElement>('svg');
    let g = svg.select<SVGGElement>('g.graph');

    let containerWidth = element.offsetWidth;
    let containerHeight = element.offsetHeight;
    let bbox = g.node().getBBox();

    const paddingFactor = 0.95;
    let scale = paddingFactor * Math.min(
      containerWidth / bbox.width,
      containerHeight/ bbox.height
    );

    let widthOffset =
      (containerWidth - bbox.width * scale)/2 - bbox.x * scale;
    let heightOffset =
      (containerHeight - bbox.height * scale)/2 - bbox.y * scale;

    let t: d3.ZoomTransform = d3.zoomIdentity
      .translate(widthOffset, heightOffset).scale(scale);
  
    this._scale.transform(g, t);
    this.handleZoom()
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
    let element: HTMLDivElement = this._graphContainer.nativeElement;
    let containerWidth = element.offsetWidth;
    let containerHeight = element.offsetHeight;

    // our properly typed svg elements
    let svg = d3.select(element).select<SVGElement>('svg');
    let g = svg.select<SVGGElement>('g.graph');

    let t;

    if (d3.event && d3.event.transform) {
      t = d3.event.transform;
      let s = t.k;

      // the bounding box of the graph group
      let bbox = g.node().getBBox();

      // calculate the translation so that the graph stays in the view
      t.x = Math.max(
              (-bbox.x * s - bbox.width * s + bbox.width / 3 * Math.sqrt(s)),
              Math.min(t.x, containerWidth - bbox.width / 3 * Math.sqrt(s)));
      t.y = Math.max(
              (-bbox.y * s - bbox.height * s + bbox.height / 3 * Math.sqrt(s)),
              Math.min(t.y, containerHeight - bbox.height / 3 * Math.sqrt(s)));
    } else {
      t = d3.zoomIdentity;
      let currentTransform = d3.zoomTransform(g.node());
      t.x += currentTransform.x;
      t.y += currentTransform.y;
      t.k = currentTransform.k;
    }

    g.attr('transform', t);
  }

  // TODO: unused!
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
