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
  private _width: number;
  private _height: number;
  private _nodeRadius: number = 100;

  constructor() {
  }

  ngAfterViewInit() {
    this.initMiniMap();

    if (this.graphData)
      this.updateGraph();

    // handle window resize events
    Observable.fromEvent(window, 'resize')
      .debounceTime(50) // debounce for 50ms
      .subscribe(() => this.handleResize());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.graphData) {
      this.updateGraph();
    }
  }

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
   * Transforms the graph so that it fits the container.
   * 
   * @method fitContainer
   */
  fitContainer(maxScale?: number): void {
    const element = this._miniMapContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const graph = svg.select<SVGGElement>('g#graph');

    // return if the graph is empty
    if (!graph.node())
      return;

    // get boundaries of the container and the graph group
    const containerWidth = this._width;
    const containerHeight = this._height;
    const bbox = graph.node().getBBox();

    // calculate the scale
    const padding = 0.05; // 5 percent
    let scale = (1 - padding) * Math.min(
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

    graph.attr('transform', t.toString());
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