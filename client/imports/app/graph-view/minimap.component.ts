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
import { Observable } from 'rxjs';

import * as d3 from 'd3';

import {
  Edge,
  InfoGraph,
  Node
} from '../../../../both/models';

import styleUrl from './minimap.component.scss';
import template from './minimap.component.html';

/**
 * Displays a mini map of the graphData input and highlights the currently
 * visible area of the graph.
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
  @Input() graphViewWidth: number;
  @Input() graphViewHeight: number;
  @Input() graphViewTransform: d3.ZoomTransform;
  private _width: number;
  private _height: number;
  private _padding: number = 0.05; // 5%
  private _transform: d3.ZoomTransform;
  private _nodeRadius: number = 100;

  constructor() {
  }

   /**
   * Called after the view has been initialized.
   * Prepares the SVG element.
   * 
   * Note: This is important! The ViewChild _miniMapContainer can't be accessed
   *       prior to this event. Therefore, this is the earliest point in time
   *       where we can append our SVG element to the _miniMapContainer.
   * 
   * @method ngAfterViewInit
   */
  ngAfterViewInit(): void {
    this.initMiniMap();

    if (this.graphData)
      this.updateGraph();

    // handle window resize events
    Observable.fromEvent(window, 'resize')
      .debounceTime(50) // debounce for 50ms
      .subscribe(() => this.handleResize());
  }

  /**
   * Called when at least one input property has been changed.
   * Updates the graph and/or the visible area.
   * 
   * @method ngOnChanges
   * @param  {SimpleChanges} changes The changed input properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.graphData) {
      this.updateGraph();
    }

    if (changes.graphViewWidth ||
      changes.graphViewHeight ||
      changes.graphViewTransform) {
        this.updateVisibleArea();
    }
  }

  /**
   * Initializes the SVG object and some child elements.
   * 
   * @method initMiniMap
   */
  initMiniMap(): void {
    const element = this._miniMapContainer.nativeElement;
    this._width = element.clientWidth;
    this._height = element.clientHeight;

    const svg = d3.select(element).append('svg')
      .attr('width', this._width)
      .attr('height', this._height);

    const graph = svg.append('svg:g')
      .attr('id', 'graph')
      .attr('class', 'minimap__graph');
    
    // append one group each for both edges and nodes
    graph.append('svg:g')
      .attr('id', 'edges')
    graph.append('svg:g')
      .attr('id', 'nodes');

    // append a rect for the currently visible area of the graph
    svg.append('svg:rect')
      .attr('id', 'visibleArea')
      .attr('stroke-alignment', 'outer');
  }

  /**
   * Updates the graph:
   * Appends new nodes and edges or updates properties of existing nodes
   * by calling the designated methods.
   * 
   * @method updateGraph
   */
  updateGraph(): void {
    if (!this.graphData || !this.graphData.nodes || !this.graphData.nodes.length)
      return;

    // draw the edges and nodes
    this.updateEdges();
    this.updateNodes();

    // resize the graph to fit the mini map container
    this.fitContainer();
  }

  /**
   * Draws the edges according to the current dataset (graphData).
   * Properly updates existing edges or removes edges that don't exist anymore.
   * 
   * @method updateEdges
   */
  updateEdges(): void {
    if (!this.graphData.edges || !this.graphData.edges.length)
      return;
    
    const element = this._miniMapContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const graph = svg.select<SVGGElement>('g#graph');
    const edges = graph.select('g#edges');

    const line = edges.selectAll('line.edge')
      .filter((d: Edge) => d !== null)
      .data(this.graphData.edges);

    line.enter()
      .append('svg:line') // append new edges when required
        .attr('class', 'edge')
      .merge(line) // merge with existing edges and update the positions
        .each((d: Edge, i: number, g: Element[]) => {
          const source: Node = this.graphData.nodes.filter((node: Node) => {
            return node._id === d.source;
          })[0];
          const target: Node = this.graphData.nodes.filter((node: Node) => {
            return node._id === d.target;
          })[0];

          d3.select(g[i])
            .attr('x1', source.x)
            .attr('y1', source.y)
            .attr('x2', target.x)
            .attr('y2', target.y)
        });
    
    // remove edges that don't exist anymore
    line.exit().remove();
  }

  /**
   * Draws the nodes according to the current dataset (graphData).
   * 
   * @method updateNodes
   */
  updateNodes(): void {
    if (!this.graphData.nodes || !this.graphData.nodes.length)
      return;
    const element = this._miniMapContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const graph = svg.select<SVGGElement>('g#graph');
    const nodes = graph.select('g#nodes');

    const node = nodes.selectAll('g.node')
      .data(this.graphData.nodes);
      
    node.enter()
      .append('svg:g')
        .attr('class', 'node')
        .attr('id', (d: Node) => d._id)
        .each(this.addNode)
      .merge(node)
        .each(this.updateNode);

    node.exit().remove();
  }

  /**
   * Adds a node to the drawn graph.
   * 
   * @method addNode
   * @param  {Node} d
   * @param  {number} i
   * @param  {Element[]} g
   */
  addNode = (d: Node, i: number, g: Element[]) => {
    const group = d3.select(g[i]);

    group.append('svg:circle')
      .attr('class', 'node__circle')
      .attr('r', this._nodeRadius);
  }

  /**
   * Updates a single node.
   * 
   * @method updateNode
   * @param  {Node} d
   * @param  {number} i
   * @param  {Element[]} g
   */
  updateNode = (d: Node, i: number, g: Element[]) => {
    const group = d3.select(g[i]);

    group.select('circle.node__circle')
      .attr('cx', (d: Node) => d.x)
      .attr('cy', (d: Node) => d.y);
  }

  /**
   * Updates the attributes of the visibleArea rect according to the
   * current transform in the graphView.
   * 
   * @method updateVisibleArea
   */
  updateVisibleArea(): void {
    const element = this._miniMapContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const graph = svg.select<SVGGElement>('g#graph');
    const visibleArea = svg.select('rect#visibleArea');

    if (graph.empty())
      return;

    // calculate the width and height of the area
    const visibleAreaWidth = this.graphViewWidth / this.graphViewTransform.k;
    const visibleAreaHeight = this.graphViewHeight / this.graphViewTransform.k;

    // calculate the coordinates of the top left corner
    const visibleAreaX = this._transform.x / this._transform.k -
      this.graphViewTransform.x / this.graphViewTransform.k;
    const visibleAreaY = this._transform.y / this._transform.k -
      this.graphViewTransform.y / this.graphViewTransform.k;
    
    /**
     * Apply the values the the attributes.
     * 
     * The strokeWidth is added to compensate for the fact that the stroke is
     * drawn centered on the shapes path.
     */
    const strokeWidth = 4;

    visibleArea
      .attr('width', visibleAreaWidth  * this._transform.k + strokeWidth)
      .attr('height', visibleAreaHeight  * this._transform.k + strokeWidth)
      .attr('x', visibleAreaX  * this._transform.k - strokeWidth / 2)
      .attr('y', visibleAreaY  * this._transform.k  - strokeWidth / 2);
  }

  /**
   * Transforms the graph so that it fits into the container.
   * 
   * @method fitContainer
   */
  fitContainer(maxScale?: number): void {
    if (!this._miniMapContainer || !this._miniMapContainer.nativeElement)
      return;
      
    const element = this._miniMapContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const graph = svg.select<SVGGElement>('g#graph');

    // return if the graph is empty
    if (graph.empty())
      return;

    // get boundaries of the container and the graph group
    const containerWidth = this._width;
    const containerHeight = this._height;
    const bbox = graph.node().getBBox();

    if (! containerWidth || !containerHeight || !bbox)
      return;

    // calculate the scale
    let scale = (1 - this._padding) * Math.min(
      containerWidth / bbox.width,
      containerHeight / bbox.height
    );

    if (maxScale)
      scale = Math.min(scale, maxScale);
    
    // calculate the x and y offsets to center the graph
    const widthOffset =
      (containerWidth - bbox.width * scale) / 2 - bbox.x * scale;
    const heightOffset =
      (containerHeight - bbox.height * scale) / 2 - bbox.y * scale;

    // put everything together and emit the event
    const t: d3.ZoomTransform = d3.zoomIdentity
      .translate(widthOffset, heightOffset)
      .scale(scale);

    // apply the transformation
    graph.attr('transform', t.toString());

    // store the current transform
    this._transform = t;
  }

  /**
   * Resizes the SVG element when the window or container has been resized.
   * 
   * @method handleResize
   */
  handleResize(): void {
    const element = this._miniMapContainer.nativeElement;
    this._width = element.clientWidth;
    this._height = element.clientHeight;

    d3.select(element)
      .select('svg')
      .attr('width', this._width)
      .attr('height', this._height);

    // fit the graph to the container
    this.fitContainer();
  }
}