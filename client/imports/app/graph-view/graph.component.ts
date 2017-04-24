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
import {
  Observable
} from 'rxjs';
import * as d3 from 'd3';

import {
  ModalService
} from '../shared/modal.module';
import {
  NodeModalComponent
} from './node-modal.component';

import {
  Edge,
  InfoGraph,
  Node
} from '../../../../both/models';

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
  styles: [styleUrl],
  encapsulation: ViewEncapsulation.None
})
export class GraphComponent implements AfterViewInit, OnChanges {
  @ViewChild('graphContainer') private _graphContainer: ElementRef;
  @Input() graphData: InfoGraph;
  @Input() isEditing: boolean = false;
  private _graph: any;
  private _width: number;
  private _height: number;
  // make sure that the radius is the same as in the scss file!
  private _nodeRadius: number = 100;
  private _outerNodeRadius: number = 112;
  private _scale: d3.ZoomBehavior<SVGGElement, any>;

  /**
   * Creates an instance of the GraphComponent.
   * 
   * @param {ModalService} _modalService 
   * @constructor
   */
  constructor(private _modalService: ModalService) { }

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
   * Handles input changes.
   * 
   * @method ngOnChanges
   * @param  {SimpleChanges} changes An event of changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isEditing)
      this.toggleEditing();

    if (changes.graphData)
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

    this._graph = svg.append('svg:g')
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

    // TODO: properly remove/update nodes

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
    g.selectAll('g .node')
      .data(this.graphData.nodes)
      .enter()
      .append('svg:g')
      .attr('class', 'node')
      .attr('id', (d: Node) => d._id)
      .each(this.addNode)

    if (centerGraph) {
      this.fitContainer();
    }
  }

  addNode = (d: Node, i: number, g: d3.EnterElement[]) => {
    let group = d3.select(g[i]);

    group.append('svg:circle')
      .attr('class', 'outer')
      .attr('cx', (d: Node) => d.x)
      .attr('cy', (d: Node) => d.y)
      .attr('r', this._outerNodeRadius);

    group.append('svg:circle')
      .attr('class', 'inner')
      .attr('cx', (d: Node) => d.x)
      .attr('cy', (d: Node) => d.y)
      .attr('r', this._nodeRadius);


    // draw the content in front of the nodes
    group.append('svg:g')
      .attr('class', 'node__content')
      .each(this.renderNodeContent)

    group.on('mousedown', this.toggleNodeFocus);
  }

  /**
   * Appends text elements (title and content) to the graph which are
   * contained within the nodes circles.
   * 
   * Note: This is rather sketched out than properly implemented. Could be done
   *       way better by calculating actual sizes of the text elements instead
   *       of assuming that the character limits for the  different lines
   *       defined below are sufficient in most situations.
   * 
   * @method renderNodeContent
   * @param  {Node} d The node data.
   * @param  {number} i The index in the selection array.
   * @param  {EnterElement[]} p An array containing the selection's group elements.
   */
  renderNodeContent = (d: Node, i: number, p: d3.EnterElement[]) => {
    // define the max amount of lines with their max character amount
    const maxCTitle = [10, 14, 16]; // title lines
    const maxCContent = [36, 35, 33, 32, 27, 18]; // content lines

    // add the title
    let titleArr = d.title.split(' ');
    let lines = this.generateTextLines(titleArr, maxCTitle);
    let element = d3.select(p[i])

    for (let k = 0; k < lines.length; k++) {
      element.append('svg:text')
        .attr('class', 'node__content__title')
        .attr('x', d.x - 25)
        .attr('y', d.y - 60 + k * 16)
        .text(lines[k]);
    }

    // add the content
    let contentArr = d.content.split(' ');
    lines = this.generateTextLines(contentArr, maxCContent);

    for (let k = 0; k < lines.length; k++) {
      element.append('svg:text')
        .attr('class', 'node__content__text')
        .attr('x', d.x - 95 + Math.pow(1.3 * k, 2))
        .attr('y', d.y + k * 16)
        .text(lines[k]);
    }
  }

  /**
   * Sets the focus state of a node after removing all other occuring focus states.
   * 
   * @method toggleNodeFocus
   * @param  {Node} d
   */
  toggleNodeFocus = (d: Node) => {
    if (d3.event && d3.event.button === 2) { // this is a right click
      d3.event.stopImmediatePropagation();
      return;
    }

    if (!(d3.event && d3.event.target && d3.event.target.parentElement))
      return;

    // references to important elements
    let element = this._graphContainer.nativeElement;
    let svg = d3.select(element).select<SVGElement>('svg');
    let g = svg.select<SVGGElement>('g.graph');

    // get the Node element of the click source
    let src = d3.event.target
    let node: d3.Selection<SVGGElement, any, any, any>;

    if (src.tagName === 'text') {
      node = d3.select(src.parentElement.parentElement);
    } else if (src.tagName === 'circle') {
      node = d3.select(src.parentElement);
    } else {
      return;
    }

    if (node.classed('node--selected')) {
      // don't change a thing
      return;
    } else if (node.classed('node')) {
      // remove any existing focus states
      this.removeNodeFocus();

      // apply the focus state
      node.classed('node--selected', true)

      // add the detailButton if not in editing mode
      if (!this.isEditing) {
        // position for the detailButton
        let detailButtonX = d.x + 35;
        let detailButtonY = d.y + 35;

        // create a group for the detailButton
        let detailButton = node.append('svg:g')
          .attr('id', 'detailButton-' + d._id)
          .attr('class', 'focus-button');

        // add a rect for the button background
        let detailButtonBg = detailButton.append('svg:rect')
          .attr('x', detailButtonX)
          .attr('y', detailButtonY)
          .attr('height', '28')
          .attr('rx', '14');

        // add the icon
        let detailButtonIcon = detailButton.append('svg:use')
          .attr('xlink:href', 'icons/svg-sprite-navigation-symbol.svg#ic_arrow_forward_24px')
          .attr('x', detailButtonX + 8)
          .attr('y', detailButtonY + 2)
          .attr('width', 24)
          .attr('height', 24);

        // add the button label
        let detailButtonLabel = detailButton.append<SVGTextElement>('svg:text')
          .attr('class', 'focus-button__label')
          .attr('x', detailButtonX + 36)
          .attr('y', detailButtonY + 20)
          .text('öffnen');

        // finally set the rect width according to the text width
        let labelBoundings: SVGRect = detailButtonLabel.node().getBBox();
        detailButtonBg.attr('width', 54 + labelBoundings.width);

        // add the mousedown handler
        detailButton.on('mousedown', (node: Node) => {
          if (d3.event.button === 2) {
            d3.event.stopImmediatePropagation();
            return;
          }

          this._modalService.create(NodeModalComponent, {
            node: node
          });
        });
      }

      // add the editing buttons if in editing mode
      if (this.isEditing) {
        // TODO
      }
    }
  }

  removeNodeFocus() {
    let element = this._graphContainer.nativeElement;
    d3.select(element)
      .select<SVGElement>('svg')
      .select<SVGGElement>('g.graph')
      .selectAll('g .node--selected')
        .classed('node--selected', false)
        .select('g .focus-button')
          .on('mousedown', null) // reset the click handler
          .remove(); // remove the button group
  }

  /**
   * Returns an array of Strings where each array entry is composed of the
   * maximum amount of words of the input array while considering the maximum
   * character count of each line. Doesn't break words.
   * 
   * @method generateTextLines
   * @param {string[]} textArr The text split into single words.
   * @param {number[]} maxC An array of the maximum character count per line.
   * @returns {string[]}
   */
  generateTextLines(textArr: string[], maxC: number[]): string[] {
    let newArr = textArr;
    let lines: string[] = [];

    for (let i = 0; i < maxC.length; i++) {
      // check whether there's still some text left
      if (newArr.length) {
        // create a new array entry
        lines.push('');

        // add as many words as possible (considering the max line length)
        while (newArr.length && (lines[i].length + newArr[0].length) <= maxC[i]) {
          lines[i] += ' ' + String(newArr.splice(0, 1));
        }

        // if it's the last line and there is some text left, add an ellipsis
        if (i === maxC.length - 1 && newArr.length && lines[i].length < maxC[i]) {
          lines[i] += '…';
        } else if (i === maxC.length - 1 && newArr.length) {
          lines[i] = lines[i].substr(0, maxC[i] - 2) + '…';
        }
      }
    }

    return lines;
  }

  toggleEditing(): void {
    // TODO

    let element = this._graphContainer.nativeElement;
    let svg = d3.select(element).select<SVGElement>('svg');
    let g = svg.select<SVGGElement>('g.graph');

    // select the currently focused node if there is any
    let currentFocus: d3.Selection<SVGGElement, any, any, any> = g.select<SVGGElement>('g .node--selected')

    if (currentFocus.node()) {
      this.removeNodeFocus(); // remove the current focus
     // TODO: add the focus state back to the node
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
      containerHeight / bbox.height
    );

    // calculate the x and y offsets to center the graph
    let widthOffset =
      (containerWidth - bbox.width * scale) / 2 - bbox.x * scale;
    let heightOffset =
      (containerHeight - bbox.height * scale) / 2 - bbox.y * scale;

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
    if (!d3.event || !d3.event.transform)
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