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
import { Html5Entities } from 'html-entities';

import {
  ModalService
} from '../shared/modal.module';
import {
  NodeModalComponent,
  NodeEditModalComponent,
  GraphViewService
} from './index';

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
  private _width: number;
  private _height: number;
  private _graphOffset: {
    x: number,
    y: number
  } = { x: 0, y: 0 };
  private _nodeRadius: number = 100;
  private _outerNodeRadius: number = 112;
  private _scale: d3.ZoomBehavior<SVGGElement, any>;
  private _drag: d3.DragBehavior<SVGGElement, any, any>;
  private _localNodeData = d3.local();
  private _htmlEntities: Html5Entities;

  /**
   * Creates an instance of the GraphComponent.
   * 
   * @param {ModalService} _modalService 
   * @constructor
   */
  constructor(private _graphViewService: GraphViewService, private _modalService: ModalService) {
    this._htmlEntities = new Html5Entities();
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

    if (this.graphData)
      this.updateGraph(true);

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
    if (changes.isEditing) {
      this.toggleEditing();
      return;
    } else if (changes.graphData) {
      this.updateGraph();
    }
  }

  /**
   * Initializes the graph.
   * Appends a SVG element to the graphContainer and
   * sets the height and width of the element.
   * 
   * @method initGraph
   */
  initGraph(): void {
    const element = this._graphContainer.nativeElement;
    this._width = element.offsetWidth;
    this._height = element.offsetHeight;

    const svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    svg.append('svg:g')
      .attr('class', 'graph');

    // set up the zoom behavior on the svg element
    this._scale = d3.zoom()
      .scaleExtent([0.1, 5])
      .on('zoom', () => this.handleZoom());

    svg.call(this._scale);

    // set up the drag behavior for nodes
    this._drag = d3.drag()
      .on('drag', (d: Node, i: number, g: Element[]) => this.dragNode(d, i, g))
      .on('end', (d: Node, i: number, g: Element[]) => this.saveNodePosition(d, i, g));
  }

  /**
   * Prepares a new graph by adding a single empty node as a starting point if
   * the user is in the editing mode.
   * 
   * @method prepareNewGraph 
   */
  prepareNewGraph(): void {
    if (!this.isEditing)
      return;

    this.removeAllNodes();

    const element = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const g = svg.select<SVGGElement>('g.graph');

    const newNode = g.append<SVGGElement>('svg:g')
      .attr('class', 'node node--new')

    newNode.append('svg:circle')
      .attr('class', 'inner')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', this._nodeRadius);
    
    const iconUrl = 'icons/svg-sprite-content-symbol.svg#ic_add_24px';
    newNode.append('svg:use')
      .attr('xlink:href', iconUrl)
      .attr('x', -50)
      .attr('y', -50)
      .attr('width', 100)
      .attr('height', 100);

    newNode.on('mousedown', () => {
      if (d3.event && d3.event.button === 2) { // ignore right clicks
        d3.event.stopImmediatePropagation();
        return;
      }
      this._graphViewService.addInfoGraphNode();
    });

    this.fitContainer(2);
  }

  /**
   * Updates the graph:
   * Appends new nodes and edges or updates properties of existing nodes.
   * 
   * @method updateGraph
   * @param  {boolean} centerGraph Whether the graph should be centered.
   */
  updateGraph(centerGraph: boolean = false): void {
    if (!this.graphData)
      return;
    
    if (!this.graphData.nodes || !this.graphData.nodes.length) {
      this.prepareNewGraph();
      return;
    }

    // draw the edges
    this.updateEdges();

    // draw the nodes
    if (this.graphData.nodes && this.graphData.nodes.length)
      this.updateNodes();

    if (centerGraph) {
      this.fitContainer();
    }
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
    
    const element = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const g = svg.select<SVGGElement>('g.graph');

    const line = g.selectAll('.edge')
      .data(this.graphData.edges);

    line.enter()
      .append('line') // append new edges when required
        .attr('class', 'edge')
        .attr('data-source-id', (d: Edge) => d.source)
        .attr('data-target-id', (d: Edge) => d.target)
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
    const element = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const g = svg.select<SVGGElement>('g.graph');
  
    // update the offset of the graph
    this.updateGraphOffset()
    
    g.selectAll('g .node--new')
      .remove();

    const node = g.selectAll('g .node')
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
   * Removes all nodes from the graph.
   * 
   * @method removeAllNodes
   */
  removeAllNodes(): void {
    const element = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const g = svg.select<SVGGElement>('g.graph');

    g.selectAll('g .node')
      .remove();
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
      .attr('class', 'outer')
      .attr('r', this._outerNodeRadius);

    group.append('svg:circle')
      .attr('class', 'inner')
      .attr('r', this._nodeRadius);

    group.on('mousedown', this.toggleNodeFocus);
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
    const previousData = this._localNodeData.get(g[i]);

    // compare the local node data to the updated data
    if (previousData === d)
      return; // the data is the same, no update required!

    group.select('circle.outer')
      .attr('cx', (d: Node) => d.x)
      .attr('cy', (d: Node) => d.y);

    group.select('circle.inner')
      .attr('cx', (d: Node) => d.x)
      .attr('cy', (d: Node) => d.y);
    
    // draw the content in front of the nodes
    group.select('g.node__content').remove();
    group.append('svg:g')
      .attr('class', 'node__content')
      .each(this.renderNodeContent);
    
    /**
     * this is somehow required to update the lines on drag if the previous
     * drag originated from the same element...
     * 
     * TODO: Find another way!
     */ 
    if (group.attr('class').includes('node--selected')) {
      this.removeNodeFocus()
      this.toggleNodeFocus(d);
    }

    // update the local node data
    group.each((d: Node) => this._localNodeData.set(g[i], d));
  }

  /**
   * Handles drag events of nodes.
   * 
   * @method dragNode
   * @param  {Node} d
   * @param  {number} i
   * @param  {Element[]} g
   */
  dragNode = (d: Node, i: number, g: Element[]) => {
    const svg = d3.select(this._graphContainer.nativeElement)
      .select('svg')
      .select('g.graph');

    const node = svg.select<SVGGElement>(`g [id='${d._id}'`);

    const dx = d3.event.dx;
    const dy = d3.event.dy;

    // update the node data
    d.x = d.x + dx;
    d.y = d.y + dy;

    // update the position of the drawn circles
    node.selectAll('circle')
      .each((d: Node, i: number, g: SVGCircleElement[]) => {
        const circle = d3.select(g[i]);
        const x = Number(circle.attr('cx'));
        const y = Number(circle.attr('cy'));

        circle
          .attr('cx', x + dx)
          .attr('cy', y + dy);
      })
    
    // update the position of the drawn text elements
    node.selectAll('text')
      .each((d: Node, i: number, g: SVGTextElement[]) => {
        const text = d3.select(g[i]);
        const x = Number(text.attr('x'));
        const y = Number(text.attr('y'));

        text
          .attr('x', x + dx)
          .attr('y', y + dy);
      })
    
    // update the position of the drawn rects
    node.selectAll('rect')
      .each((d: Node, i: number, g: SVGRectElement[]) => {
        const rect = d3.select(g[i]);
        const x = Number(rect.attr('x'));
        const y = Number(rect.attr('y'));
        
        rect
          .attr('x', x + dx)
          .attr('y', y + dy);
      })
    
    // update the position of the drawn icons
    node.selectAll('use')
      .each((d: Node, i: number, g: SVGRectElement[]) => {
        const use = d3.select(g[i]);
        const x = Number(use.attr('x'));
        const y = Number(use.attr('y'));
        
        use
          .attr('x', x + dx)
          .attr('y', y + dy);
      })
    
    // update the edges
    this.updateEdges();
  }

  /**
   * Stores the updated node position in the collection.
   * 
   * @method saveNodePosition
   * @param  {Node} d
   * @param  {number} i
   * @param  {Element[]} g
   */
  saveNodePosition = (d: Node, i: number, g: Element[]) => {
    this._graphViewService.updateInfoGraphNode(d);
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
   * @param  {Element[]} p An array containing the selection's group elements.
   */
  renderNodeContent = (d: Node, i: number, p: Element[]) => {
    // define the max amount of lines with their max character amount
    const maxCTitle = [10, 14, 16]; // title lines
    const maxCContent = [36, 35, 33, 32, 27, 18]; // content lines
    const HTMLTagsRegEx = /<[^>]+>/ig // RegEx for identifying HTML tags

    /**
     * add the title
     * 
     * 1. Decode HTML entities.
     * 2. Split the string into an array.
     * 3. Generate the text according to the different line lenghts.
     * 4. Add the text lines as single text elements.
     */ 
    const titleArr = this._htmlEntities.decode(d.title)
      .split(' ');
    let lines = this.generateTextLines(titleArr, maxCTitle);
    const element = d3.select(p[i])

    for (let k = 0; k < lines.length; k++) {
      element.append('svg:text')
        .attr('class', 'node__content__title')
        .attr('x', d.x - 25)
        .attr('y', d.y - 60 + k * 16)
        .text(lines[k]);
    }

     /**
     * add the content: similar to adding the title, but also stripping
     * all HTML tags since the content will be added as plain text elements.
     */ 
    const contentArr = this._htmlEntities.decode(d.content)
      .replace(HTMLTagsRegEx,' ')
      .split(' ');
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

    // references to important elements
    const element = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const g = svg.select<SVGGElement>('g.graph');

    // get the Node element of the click source
    const node: d3.Selection<SVGGElement, any, any, any> =
      g.select<SVGGElement>(`g [id='${d._id}'`);

    if (!node)
      return;

    if (node.attr('class').includes('node--selected')) {
      // don't change a thing
      return;
    } else if (node.attr('class').includes('node')) {
      // remove any existing focus states
      this.removeNodeFocus();
      
      // apply the focus state
      node.classed('node--selected', true)

      // add the detailButton if not in editing mode
      if (!this.isEditing) {
        // position of the detailButton
        const detailButtonX = d.x + 60;
        const detailButtonY = d.y + 35;
        const detailButtonIcon = 'icons/svg-sprite-navigation-symbol.svg#ic_arrow_forward_24px';

        // create the detailButton
        const detailButton = this.appendFocusButton(node, d, 'DetailButton',
          detailButtonX, detailButtonY, detailButtonIcon, 'öffnen');

        // add the click handler
        detailButton.on('click', (node: Node) => {
          if (d3.event.button === 2) {
            d3.event.stopImmediatePropagation();
            return;
          }

          this._modalService.create(NodeModalComponent, {
            node: node
          });
        });
      } else { // add the editing buttons if in editing mode
        // positions of the buttons        
        const editButtonX = d.x + 72;
        const editButtonY = d.y;
        const editButtonIcon = 'icons/svg-sprite-content-symbol.svg#ic_create_24px';
        const dragButtonX = d.x + 60;
        const dragButtonY = d.y + 35;
        const dragButtonIcon = 'icons/svg-sprite-action-symbol.svg#ic_open_with_24px';

        // append the buttons
        const editButton = this.appendFocusButton(node, d, 'EditButton', editButtonX,
          editButtonY, editButtonIcon, 'bearbeiten');
        const dragButton = this.appendFocusButton(node, d, 'dragButton', dragButtonX,
          dragButtonY, dragButtonIcon, 'verschieben');

        // set up the mousedown handlers
        editButton.on('mousedown', (node: Node) => {
          if (d3.event.button === 2) {
            d3.event.stopImmediatePropagation();
            return;
          }

          this._modalService.create(NodeEditModalComponent, {
            node: node
          });
        });

        // set up the mousedown handlers
        dragButton.call(this._drag);
      }
    }
  }

  /**
   * Appends a button to the passed group 'node' and returns a reference to it.
   * 
   * @method appendFocusButton
   * @param  {d3.Selection<SVGGElement, any, any, any>} node The group to which the button will be appended.
   * @param  {Node} d The node data.
   * @param  {string} type The button type (currently used for the ID).
   * @param  {string} x The x-coordinate of the button.
   * @param  {string} y The y-coordinate of the button.
   * @param  {string} iconUrl The icon URL.
   * @param  {string} label The button label text.
   * @return {d3.Selection<SVGGElement, any, any, any>} The button group.
   */
  appendFocusButton(node: d3.Selection<SVGGElement, any, any, any>, d: Node,
    type: string, x: number, y: number, iconUrl: string, label: string
  ): d3.Selection<SVGGElement, any, any, any> {
    // create a group for the editButton
    const button = node.append<SVGGElement>('svg:g')
      .attr('id', type + '-' + d._id)
      .attr('class', 'focus-button');

    // add a rect for the button background
    const buttonBg = button.append('svg:rect')
      .attr('x', x)
      .attr('y', y)
      .attr('height', '28')
      .attr('rx', '14');
    // add the icon
    const buttonIcon = button.append('svg:use')
      .attr('xlink:href', iconUrl)
      .attr('x', x + 8)
      .attr('y', y + 2)
      .attr('width', 24)
      .attr('height', 24);

    // add the button label
    const buttonLabel = button.append<SVGTextElement>('svg:text')
      .attr('class', 'focus-button__label')
      .attr('x', x + 36)
      .attr('y', y + 21)
      .text(label);

    // finally set the rect width according to the text width
    const labelBoundings: SVGRect = buttonLabel.node().getBBox();
    buttonBg.attr('width', 48 + labelBoundings.width);

    return button;
  }

  /**
   * Removes the focus state from all currently selected nodes.
   * 
   * @method removeNodeFocus
   */
  removeNodeFocus() {
    const element = this._graphContainer.nativeElement;
    d3.select(element)
      .select<SVGElement>('svg')
      .select<SVGGElement>('g.graph')
      .selectAll('g .node--selected')
        .classed('node--selected', false)
        .selectAll('g .focus-button')
          .on('mousedown', null) // reset the click handler
          .on('click', null) // reset the click handler
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
    const newArr = textArr;
    const lines: string[] = [];

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

  /**
   * Toggles between the editing and viewing mode.
   * 
   * @method toggleEditing
   */
  toggleEditing(): void {
    const element = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const g = svg.select<SVGGElement>('g.graph');

    // select the currently focused node if there is any
    const currentFocus: d3.Selection<SVGGElement, any, any, any> = g.select<SVGGElement>('g .node--selected')

    if (currentFocus.node()) {
      this.removeNodeFocus(); // remove the current focus
      this.toggleNodeFocus(currentFocus.data()[0])     
    }

    if (!this.graphData.nodes || !this.graphData.nodes.length) {
      if (this.isEditing) {
        this.prepareNewGraph();
      } else {
        this.removeAllNodes();
      }
    }
      
  }

  /**
   * Transforms the graph so that it fits the container.
   * 
   * @method fitContainer
   */
  fitContainer(maxScale?: number): void {
    const element = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const g = svg.select<SVGGElement>('g.graph');

    // return if the graph is empty
    if (!g.node())
      return;

    // get boundaries of the container and the graph group
    const containerWidth = this._width;
    const containerHeight = this._height;
    const bbox = g.node().getBBox();

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

    svg.call(this._scale.transform, t);
  }

  /**
   * Resizes the SVG element when the window has been resized.
   * 
   * @method handleWindowResize
   */
  handleWindowResize(): void {
    const element = this._graphContainer.nativeElement;
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

    const element: HTMLDivElement = this._graphContainer.nativeElement;
    const containerWidth = element.offsetWidth;
    const containerHeight = element.offsetHeight;

    // our properly typed SVG elements
    const svg = d3.select(element).select<SVGElement>('svg');
    const g = svg.select<SVGGElement>('g.graph');

    // the bounding box of the graph group
    const bbox = g.node().getBBox();

    // the requested transformation (t) and scale (s)
    const t = d3.event.transform;
    const s = t.k;

    // calculate the transformation so that the graph stays in the view
    t.x = Math.max(
      (-bbox.x * s - bbox.width * s + this._nodeRadius * s),
      Math.min(t.x, containerWidth - this._graphOffset.x * s));
    t.y = Math.max(
      (-bbox.y * s - bbox.height * s + this._nodeRadius * s),
      Math.min(t.y, containerHeight - this._graphOffset.y * s));
    
    // update the transform attribute of the SVG graph group
    g.attr('transform', t);
  }

  /**
   * Updates the _graphOffset.
   * 
   * The offset contains the x- and y-coordinate of the graph's nodes with
   * the minimum x- respectively y-coordinate. The offset is required to
   * calculate the correct limits of the zoom transformation.
   * 
   * @method updateGraphOffset
   */
  updateGraphOffset(): void {
    let min: { x: number, y: number } = {
      x: null,
      y: null
    };
    
    this.graphData.nodes.forEach(node => {
      if (min.x && min.y) {
        min = {
          x: Math.min(min.x, node.x),
          y: Math.min(min.y, node.y)
        };
      } else {
        min = {
          x: node.x,
          y: node.y
        };
      }
    });

    this._graphOffset = min;
  }
}