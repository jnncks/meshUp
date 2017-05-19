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
  private _width: number = 0;
  private _height: number = 0;
  private _graphOffset: {
    x: number,
    y: number
  } = { x: 0, y: 0 };
  private _nodeRadius: number = 100;
  private _outerNodeRadius: number = 112;
  private _scale: d3.ZoomBehavior<SVGGElement, any>;
  private _minScale: number = 0.1;
  private _maxScale: number = 5;
  private _currentTransform: d3.ZoomTransform;
  private _dragNode: d3.DragBehavior<SVGGElement, any, any>;
  private _dragEdge: d3.DragBehavior<SVGCircleElement, any, any>;
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
    /**
     * Wait a tick to avoid one-time devMode
     * unidirectional-data-flow-violation error
     * 
     * source:
     * http://stackoverflow.com/questions/38930183/angular2-expression-has-changed-after-it-was-checked-binding-to-div-width-wi
     */
    setTimeout(() => {
       this.initGraph();

    // append nodes and edges if the graphData is not empty
    if (this.graphData) {
      this.updateGraph();
      this.fitContainer(false); // fit the graph inside the graph container
    }

    // handle window resize events
    Observable.fromEvent(window, 'resize')
      .debounceTime(50) // debounce for 50ms
      .subscribe(() => this.handleResize());
    });
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
    this._width = element.clientWidth;
    this._height = element.clientHeight;

    const svg = d3.select(element).append('svg')
      .attr('width', this._width)
      .attr('height', this._height);

    const graph = svg.append('svg:g')
      .attr('id', 'graph')
      .attr('class', 'graph');
    
    // append one group each for both edges and nodes
    graph.append('svg:g')
      .attr('id', 'edges')
    graph.append('svg:g')
      .attr('id', 'nodes');

    // set up the zoom behavior on the svg element
    this._scale = d3.zoom()
      .scaleExtent([this._minScale, this._maxScale])
      .on('zoom', () => this.handleZoom());

    svg.call(this._scale)
      .on('dblclick.zoom', null); // disable zooming on double-click/-tap

    // set up the drag behavior for nodes
    this._dragNode = d3.drag()
      .on('drag', (d: Node, i: number, g: Element[]) => this.dragNode(d, i, g))
      .on('end', (d: Node, i: number, g: Element[]) => this.saveNodePosition(d, i, g));

    // set up the mousemove handler for new nodes
    this._graphViewService.nodeAddingChanged.subscribe(state => {
      this.handleNodeAddingModeChange(state);
    });

    // subscribe to requestNodeFocus events
    this._graphViewService.requestNodeFocus.subscribe((node: Node) => {
      // remove the current focus
      this.removeNodeFocus();

      // zoom to the new node
      const transition = this.zoomToNode(node)

      // change the focus and open the modal once the zoom transition has ended
      transition.on('end', () => {
        this.toggleNodeFocus(node);
        this._modalService.create(NodeModalComponent, {
          graph: this.graphData,
          currendNodeId: node._id,
          openInExplorationMode: true
        });
      });
    });
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
    const graph = svg.select<SVGGElement>('g#graph');
    const nodes = graph.select('g#nodes');

    const newNode = nodes.append<SVGGElement>('svg:g')
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

    this.fitContainer(false, 2);
  }

  /**
   * Updates the graph:
   * Appends new nodes and edges or updates properties of existing nodes.
   * 
   * @method updateGraph
   */
  updateGraph(): void {
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
    const graph = svg.select<SVGGElement>('g#graph');
    const edges = graph.select('g#edges');

    const line = edges.selectAll('line.edge')
      .filter((d: Edge) => d !== null)
      .data(this.graphData.edges);

    line.enter()
      .append('svg:line') // append new edges when required
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
    
    // update the positions of the edgeRemovalButtons
    this.updateEdgeRemovalButtons();
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
    const graph = svg.select<SVGGElement>('g#graph');
    const nodes = graph.select('g#nodes');
  
    // update the offset of the graph
    this.updateGraphOffset()
    
    nodes.selectAll('g.node--new')
      .remove();

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
   * Removes all nodes from the graph.
   * 
   * @method removeAllNodes
   */
  removeAllNodes(): void {
    const element = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const g = svg.select<SVGGElement>('g#graph');

    g.selectAll('g.node')
      .remove();
  }

  /**
   * Either removes the newNode element or adds it and sets up the required
   * callbacks to move it with the mouse moevement and save the new node
   * on click.
   * 
   * @method handleNodeAddingModeChange
   * @param {boolean} state The current node adding state.
   */
  handleNodeAddingModeChange(state: boolean): void {
    const element = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const graph = svg.select<SVGGElement>('g#graph');
    const nodes = graph.select('g#nodes');

    if (!state) {
      svg.on('mousemove', null); // remove the mousemove handler
      nodes.select('g#newNodePlaceholder').remove();
      return;
    }
    
    const newNode = nodes.append<SVGGElement>('svg:g')
      .attr('class', 'node node--new')
      .attr('id', 'newNodePlaceholder');

    // use the min coordinates (which hopefully are far off from other nodes)
    const coord = {
      x: Number.MIN_SAFE_INTEGER,
      y: Number.MIN_SAFE_INTEGER
    }
    // add the circle
    newNode.append('svg:circle')
      .attr('class', 'inner')
      .attr('r', this._nodeRadius)
      .attr('cx', coord.x)
      .attr('cy', coord.y);

    // add the icon
    const iconUrl = 'icons/svg-sprite-content-symbol.svg#ic_add_24px';
    newNode.append('svg:use')
      .attr('xlink:href', iconUrl)
      .attr('x', coord.x - 50)
      .attr('y', coord.y - 50)
      .attr('width', 100)
      .attr('height', 100);
      
    // move the node with the mouse
    svg.on('mousemove', () => this.handleNewNodeMousemove(newNode));

    // create the new node on mousedown
    newNode.on('mousedown', () => {
      if (d3.event && d3.event.button === 2) { // ignore right clicks
        d3.event.stopImmediatePropagation();
        return;
      }

      const circle = nodes.select('g#newNodePlaceholder').select('circle');
      this._graphViewService.addInfoGraphNode(
        Number(circle.attr('cx')),
        Number(circle.attr('cy')));

      this._graphViewService.toggleNodeAdding();
    });
  }

  /**
   * Moves the newNode to the current mouse coordinates.
   * As a result, the newNode will be moved with the mouse movement.
   * 
   * @method handleNewNodeMousemove
   * @param {d3.Selection<SVGGElement, any, any, any>} newNode The newNode which will be moved.
   */
  handleNewNodeMousemove(newNode: d3.Selection<SVGGElement, any, any, any>): void {
    if (!d3.event || d3.event.type !== 'mousemove')
      return;

    const element = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const graph = svg.select<SVGGElement>('g#graph');
    const nodes = graph.select<SVGGElement>('g#nodes');

    // get the relative mouse coordinates [x, y]
    const mouse: [number, number] = d3.mouse(nodes.node());

    // update the position
    newNode.select('circle')
      .attr('cx', mouse[0])
      .attr('cy', mouse[1]);

    newNode.select('use')
      .attr('x', mouse[0] - 50)
      .attr('y', mouse[1] - 50);
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
    const graph = svg.select('g#graph');
    const nodes = graph.select('g#nodes')

    const node = nodes.select<SVGGElement>(`g [id="${d._id}"]`);

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
      });
    
    // update the position of the drawn text elements
    node.selectAll('text')
      .each((d: Node, i: number, g: SVGTextElement[]) => {
        const text = d3.select(g[i]);
        const x = Number(text.attr('x'));
        const y = Number(text.attr('y'));

        text
          .attr('x', x + dx)
          .attr('y', y + dy);
      });
    
    // update the position of the drawn rects
    node.selectAll('rect')
      .each((d: Node, i: number, g: SVGRectElement[]) => {
        const rect = d3.select(g[i]);
        const x = Number(rect.attr('x'));
        const y = Number(rect.attr('y'));
        
        rect
          .attr('x', x + dx)
          .attr('y', y + dy);
      });
    
    // update the position of the drawn icons
    node.selectAll('use')
      .each((d: Node, i: number, g: SVGRectElement[]) => {
        const use = d3.select(g[i]);
        const x = Number(use.attr('x'));
        const y = Number(use.attr('y'));
        
        use
          .attr('x', x + dx)
          .attr('y', y + dy);
      });
    
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
   * @param  {Element[]} g An array containing the selection's group elements.
   */
  renderNodeContent = (d: Node, i: number, g: Element[]) => {
    // define the max amount of lines with their max character amount
    const maxCTitle = [10, 14, 16]; // title lines
    const maxCContent = [36, 35, 33, 32, 27, 18]; // content lines
    const HTMLTagsRegEx = /<[^>]+>/ig // RegEx for identifying HTML tags
    const iconUrl = 'icons/svg-sprite-action-symbol.svg#ic_description_24px';
    const group = d3.select(g[i])

    /**
     * add the node type icon (currently only the document type is supported)
     */
    group.append('svg:use')
      .attr('xlink:href', iconUrl)
      .attr('class', 'node__content__type-icon')
      .attr('x', d.x - 76)
      .attr('y', d.y - 72)
      .attr('width', 48)
      .attr('height', 48);

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

    for (let k = 0; k < lines.length; k++) {
      group.append('svg:text')
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
      group.append('svg:text')
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
    const graph = svg.select<SVGGElement>('g#graph');
    const nodes = graph.select('g#nodes');
    const edges = graph.select('g#edges');

    // get the Node element of the click source
    const node: d3.Selection<SVGGElement, any, any, any> =
      nodes.select<SVGGElement>(`g [id="${d._id}"]`);

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

      // apply the highlight state to the related edges
      const highlightedEdges = edges.selectAll('line.edge')
        .filter((edge: Edge) => edge.source === d._id || edge.target === d._id)
        .classed('edge--highlighted', true);

      // add the detailButton if not in editing mode
      if (!this.isEditing) {
        // position of the detailButton
        const detailButtonX = d.x + 60;
        const detailButtonY = d.y + 35;
        const detailButtonIcon = 'icons/svg-sprite-navigation-symbol.svg#ic_arrow_forward_24px';

        // create the detailButton
        const detailButton = this.appendFocusButton(node, d, 'DetailButton',
          detailButtonX, detailButtonY, detailButtonIcon, 'öffnen');

        // add the mousedown handler
        detailButton.on('mousedown', (node: Node) => {
          if (d3.event.button === 2) {
            d3.event.stopImmediatePropagation();
            return;
          }

          this._modalService.create(NodeModalComponent, {
            graph: this.graphData,
            currendNodeId: node._id
          });
        });
      } else {
        // set up the edge removal
        highlightedEdges
          .each((d: Edge, i: number, g: Element[]) =>
            this.appendEdgeRemovalButton(d, i, g));

        /* prepare the edge creation */
        // create a new group element
        const newEdgeGroup = node.append<SVGGElement>('svg:g')
          .attr('class', 'node__new-edge-group');
        
        // create an arc for the area in which a mousehover will be handled
        const arc = d3.arc()
          .innerRadius(this._nodeRadius / 1.25)
          .outerRadius(this._nodeRadius * 1.5)
          .startAngle(0)
          .endAngle(2 * Math.PI);

        const arcX = d.x;
        const arcY = d.y;

        // add the arc
        newEdgeGroup.append('svg:path')
          .attr('d', arc)
          .attr('class', 'new-edge__hover-area')
          .attr('transform', `translate(${arcX},${arcY})`);

        // set up the drag handler
        this._dragEdge = d3.drag()
          .on('start', (d: Node, i: number, g: Element[]) =>
            this.handleNewEdgeDragStart(d, i, g))
          .on('drag', (d: Node, i: number, g: Element[]) =>
            this.handleNewEdgeDrag(d, i, g))
          .on('end', (d: Node, i: number, g: Element[]) =>
            this.handleNewEdgeDragEnd(d, i, g));
        
        // set up the mouse event handlers
        newEdgeGroup
          .on('mouseenter', () => this.displayEdgeStartPoint(d, newEdgeGroup))
          .on('mouseleave', () => {
            newEdgeGroup.select('circle.new-edge__start').remove();
          });

        /* add the editing buttons */
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
        dragButton.call(this._dragNode);
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
    const graph = d3.select(element)
      .select<SVGElement>('svg')
      .select<SVGGElement>('g#graph');
    const nodes = graph.select('g#nodes');
    const edges = graph.select('g#edges');
    
    // remove the selection state from alle selected nodes
    nodes.selectAll('g.node--selected')
      .classed('node--selected', false)
      .selectAll('g.focus-button')
        .on('mousedown', null) // reset the mousedown handler
        .remove(); // remove the button group

    // remove the highlight state from highlighted edges
    edges.selectAll('line.edge--highlighted')
      .classed('edge--highlighted', false);
    this.removeEdgeRemovalButtons();
    
    // remove all new-edge elements
    nodes.selectAll('g.node__new-edge-group')
      .on('mousemove', null)
      .remove();
    nodes.selectAll('circle.new-edge__start')
      .remove();
  }

  /**
   * Displays a circle around the given node. The circle position is the
   * point on the node's outer circle which is closest to the mouse.
   * 
   * @method displayEdgeStartPoint
   * @param {Node} d 
   * @param {d3.Selection<SVGGElement, any, any, any>} container
   */
  displayEdgeStartPoint(d: Node, container: d3.Selection<SVGGElement, any, any, any>): void {
    const element = this._graphContainer.nativeElement;
    const graph = d3.select(element)
      .select<SVGElement>('svg')
      .select<SVGGElement>('g#graph');

    // add a circle as a drag point for new edges
    const newEdgeStart = container.append('svg:circle')
      .attr('class', 'new-edge__start')
      .attr('r', this._nodeRadius / 10)
      .attr('cx', Number.MIN_SAFE_INTEGER)
      .attr('cy', Number.MIN_SAFE_INTEGER);
    
    // update the position on mousemove
    container.on('mousemove', () => {
      const mouse: number[] = d3.mouse(graph.node());
      const dx = mouse[0] - d.x;
      const dy = mouse[1] - d.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const newX = d.x + dx * this._outerNodeRadius / dist;
      const newY = d.y + dy * this._outerNodeRadius / dist;

      newEdgeStart
        .attr('cx', newX)
        .attr('cy', newY);
      });
    
    // set up the drag handler of the drag circle
    newEdgeStart.call(this._dragEdge);
  }

  /**
   * Creates a temporary edge when a new-edge__start circle drag starts.
   * Sets up hover handlers for all nodes so that the target node is
   * highlighted when hovering over it.
   * 
   * @method handleNewEdgeDragStart
   * @param {Node} d 
   * @param {number} i 
   * @param {Element[]} g 
   */
  handleNewEdgeDragStart(d: Node, i: number, g: Element[]): void {
    const element = this._graphContainer.nativeElement;
    const graph = d3.select(element)
      .select<SVGElement>('svg')
      .select<SVGGElement>('g#graph');
    const edges = graph.select('g#edges');
    const nodes = graph.select('g#nodes');
    
    // get the current mouse position
    const mouse: number[] = d3.mouse(graph.node());

    // add a new line
    edges.append('svg:line')
      .attr('class', 'edge edge--new')
      .attr('x1', d.x)
      .attr('y1', d.y)
      .attr('x2', mouse[0])
      .attr('y2',mouse[1]);

    // set up hover handlers for all nodes except the source node
    nodes.selectAll('g.node')
      .filter((node: Node) => node._id !== d._id)
      .on('mouseenter', (d: Node, i: number, g: Element[]) => {
        d3.select(g[i])
          .classed('node--hover', true);
      })
      .on('mouseleave', (d: Node, i: number, g: Element[]) => {
        d3.select(g[i])
          .classed('node--hover', false);
      });
  }

  /**
   * Updates the coordinates of the temporary edge when the
   * new-edge__start circle is being dragged.
   * 
   * @method handleNewEdgeDrag
   * @param {Node} d 
   * @param {number} i 
   * @param {Element[]} g 
   */
  handleNewEdgeDrag(d: Node, i: number, g: Element[]): void {
    const element = this._graphContainer.nativeElement;
    const graph = d3.select(element)
      .select<SVGElement>('svg')
      .select<SVGGElement>('g#graph');
    const edges = graph.select('g#edges');

    const edge = edges.select('line.edge--new')

    // get the delta x/y values
    const dx = d3.event.dx;
    const dy = d3.event.dy;

    // update the new x2 and y2 values
    const x = Number(edge.attr('x2')) + dx;
    const y = Number(edge.attr('y2')) + dy;

    edge
      .attr('x2', x)
      .attr('y2', y);
  }

  /**
   * Creates a new edge when the drag ended on a node.
   * Also removes the temporary elements and hovers.
   * Called when the drag of the new-edge__start circle has ended.
   * 
   * @method handleNewEdgeDragEnd
   * @param {Node} d 
   * @param {number} i 
   * @param {Element[]} g 
   */
  handleNewEdgeDragEnd(d: Node, i: number, g: Element[]): void {
    const element = this._graphContainer.nativeElement;
    const graph = d3.select(element)
      .select<SVGElement>('svg')
      .select<SVGGElement>('g#graph');
    const nodes = graph.select('g#nodes');
    const edges = graph.select('g#edges');

    const edge = edges.select('line.edge--new')

    const target = nodes.select<SVGGElement>('g.node.node--hover')
    if (!target.empty() && target.data()[0]) {
      const targetId = target.data()[0]['_id'];

      // if we have the target's ID, create the actual edge
      if (targetId)
        this._graphViewService.createInfoGraphEdge(d._id, targetId);
    }

    // remove the temporary edge
    edge.remove();

    // remove the hover handlers
    nodes.selectAll('g.node')
      .classed('node--hover', false)
      .on('mouseenter', null)
      .on('mouseleave', null);
  }

  /**
   * Removes the edgeRemovalButton of an edge and subsequently calls the
   * removeInfoGraphEdge method of the GraphViewService.
   * 
   * @method removeEdge
   * @param {string} id 
   */
  removeEdge(id: string): void {      
      const element = this._graphContainer.nativeElement;
      const graph = d3.select(element)
        .select<SVGElement>('svg')
        .select<SVGGElement>('g#graph');
      const edges = graph.select('g#edges');

      // get a reference to the button and remove it
      const button = edges.selectAll('g.edge-button--remove')
        .filter<SVGGElement>((d: undefined, i: number, g: Element[]) =>
          d3.select(g[i]).attr('data-edge-id') === id);

      button
        .on('mousedown', null) // remove the mousedown handler
        .remove() // remove the button group

      // remove the edge from the collection's document
      this._graphViewService.removeInfoGraphEdge(id);
  }

  /**
   * Appends a new edgeRemovalButton to the given edge.
   * 
   * @method appendEdgeRemovalButton
   * @param {Edge} d 
   * @param {number} i 
   * @param {Element[]} g 
   */
  appendEdgeRemovalButton(d: Edge, i: number, g: Element[]): void {
    const element = this._graphContainer.nativeElement;
    const graph = d3.select(element)
      .select<SVGElement>('svg')
      .select<SVGGElement>('g#graph');
    const edges = graph.select('g#edges');

    const buttonGroup = edges.append('svg:g')
      .attr('class', 'edge-button edge-button--remove')
      .attr('data-edge-id', d._id);

    // append the circle
    buttonGroup.append('svg:circle')
      .attr('r', this._nodeRadius / 4);

    // append the icon
    const iconUrl = 'icons/svg-sprite-action-symbol.svg#ic_delete_24px';
    buttonGroup.append('svg:use')
      .attr('class', 'edge-button--icon')
      .attr('xlink:href', iconUrl)
      .attr('width', this._nodeRadius / 2.5)
      .attr('height', this._nodeRadius / 2.5);

    // set the position of the button
    this.updateEdgeRemovalButtons();

    buttonGroup.on('mousedown', (d: undefined, i: number, g: Element[]) => {
      const button = d3.select(g[i]);
      const edgeId = button.attr('data-edge-id');
      this.removeEdge(edgeId)
    });
  }

  /**
   * Updates the positions of all edgeRemovalButtons.
   * This is required when the selected node is dragged.
   * 
   * @method updateEdgeRemovalButtons
   */
  updateEdgeRemovalButtons(): void {
    const element = this._graphContainer.nativeElement;
    const graph = d3.select(element)
      .select<SVGElement>('svg')
      .select<SVGGElement>('g#graph');
    const edges = graph.select('g#edges');

    edges.selectAll('g.edge-button--remove')
      .each((d: undefined, i: number, g: Element[]) => {
        // get a reference to the button
        const button = d3.select(g[i])

        // select the edge by its ID
        const edge: SVGLineElement = d3.selectAll('line.edge--highlighted')
          .filter<SVGLineElement>((d: Edge) => d._id === button.attr('data-edge-id'))
          .node();

        // calculate the new midpoint of the edge
        const midX = (edge.x1.baseVal.value + edge.x2.baseVal.value) / 2;
        const midY = (edge.y1.baseVal.value + edge.y2.baseVal.value) / 2;

        // update the button's position
        button.select('circle')
          .attr('cx', midX)
          .attr('cy', midY);

        button.select('use')
          .attr('x', midX - this._nodeRadius / 5)
          .attr('y', midY - this._nodeRadius / 5);
      });
  }

  /**
   * Removes all existing edgeRemovalButtons.
   * 
   * @method removeEdgeRemovalButtons
   */
  removeEdgeRemovalButtons(): void {
    const element = this._graphContainer.nativeElement;
    const graph = d3.select(element)
      .select<SVGElement>('svg')
      .select<SVGGElement>('g#graph');
    const edges = graph.select('g#edges');

    edges.selectAll('g.edge-button--remove')
      .remove();
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
    const graph = svg.select<SVGGElement>('g#graph');
    const nodes = graph.select('g#nodes');

    // select the currently focused node if there is any
    const currentFocus: d3.Selection<SVGGElement, any, any, any> =
      nodes.select<SVGGElement>('g.node--selected')

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
    
    // finally, resize the SVG element due to the toolbar being added/removed
    setTimeout(() => this.handleResize(), 150);
  }

  /**
   * Moves the graph so that the passed node is in the center.
   * The translation is animated.
   * The returned transition object may be used for event callbacks,
   * e.g. the 'end' event of the transition.
   * 
   * @param {Node} node The node which will be focused.
   * @returns {d3.Transition<SVGElement, any, any, any>} The transition object.
   * 
   * @memberof GraphComponent
   */
  zoomToNode(node: Node): d3.Transition<SVGElement, any, any, any> {
    const element: HTMLDivElement = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const graph = svg.select<SVGGElement>('g#graph');

    // get the svg center coordinates
    const x = node.x;
    const y = node.y;
    const scale = 1.5;

    // get the current transformation
    const currentTransform: d3.ZoomTransform = d3.zoomTransform(svg.node());

    // calculate the new translation
    const newX = (this._width / 2 - x * scale);
    const newY = (this._height / 2 - y * scale);
    const newScale = scale;

    // create the new transform object
    const newTransform = d3.zoomIdentity
      .translate(newX, newY)
      .scale(newScale);

    // run the zoom animation
    return svg.transition()
      .duration(1000)
      .call((transition: d3.Transition<SVGGElement, any, any, any>) => {
        transition.call(this._scale.transform, newTransform);
      });
  }

  /**
   * Transforms the graph so that it fits the container.
   * 
   * @method fitContainer
   * @param  {boolean} animate Whether the zoom should be animated.
   * @param  {number} maxScale The maximum zoom scale.
   */
  fitContainer(animate: boolean = true, maxScale?: number): void {
    const element = this._graphContainer.nativeElement;
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

    // apply the transform to the graph
    if (animate) {
      svg.transition()
        .duration(500) // 500ms
        .call((transition: d3.Transition<SVGGElement, any, any, any>) => {
          transition.call(this._scale.transform, t);
        });
    } else {
      svg.call(this._scale.transform, t);
    }
  }

  /**
   * Resizes the SVG element when the window or container has been resized.
   * 
   * @method handleResize
   */
  handleResize(): void {
    const element = this._graphContainer.nativeElement;
    this._width = element.clientWidth;
    this._height = element.clientHeight;

    d3.select(element)
      .select('svg')
      .attr('width', this._width)
      .attr('height', this._height);
  }

  /**
   * Handles zoom callbacks: transforms the graph group ('g#graph').
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
    const graph = svg.select<SVGGElement>('g#graph');

    // the bounding box of the graph group
    const bbox = graph.node().getBBox();

    // the requested transformation (t) and scale (s)
    let t = d3.event.transform;
    const s = t.k;

    // calculate the transformation so that the graph stays in the view
    t.x = Math.max(
      (-bbox.x * s - bbox.width * s + this._nodeRadius * s),
      Math.min(t.x, containerWidth - this._graphOffset.x * s));
    t.y = Math.max(
      (-bbox.y * s - bbox.height * s + this._nodeRadius * s),
      Math.min(t.y, containerHeight - this._graphOffset.y * s));
    
    // update the transform attribute of the SVG graph group
    graph.attr('transform', t);

    this._currentTransform = t;
  }

  /**
   * Zooms in by 1.5x by calling 'zoomCenterByScale()'.
   * 
   * @method zoomIn
   */
  zoomIn(): void {
    this.zoomCenterByScale(1.5)
  }

  /**
   * Zooms out by 2/3x by calling 'zoomCenterByScale()'.
   * 
   * @method zoomOut
   */
  zoomOut(): void {
    this.zoomCenterByScale(2 / 3)
  }

  /**
   * Zooms in or out, depending on the passed scale value.
   * scale > 1 zooms in, scale < 1 zooms out.
   * 
   * @method zoomCenterByScale
   * @param {number} scale The zoom value.
   */
  zoomCenterByScale(scale: number): void {
    const element: HTMLDivElement = this._graphContainer.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const graph = svg.select<SVGGElement>('g#graph');

    // get the svg center coordinates
    const centerX = this._width / 2;
    const centerY = this._height / 2;

    // get the current transformation
    const currentTransform: d3.ZoomTransform = d3.zoomTransform(svg.node());

    if ((scale <= 1 && currentTransform.k <= this._minScale) ||
        (scale > 1 && currentTransform.k >= this._maxScale))
      return; // a zoom is not required since we've reached the minimum/maximum

    // ensure that the zoom will not exceed the minimum or maximum scale
    if (scale * currentTransform.k < this._minScale) {
      scale = this._minScale / currentTransform.k;
    } else if (scale * currentTransform.k > this._maxScale) {
      scale = this._maxScale / currentTransform.k;
    }

    // calculate the new translation
    const newX = (currentTransform.x - centerX) * scale + centerX;
    const newY = (currentTransform.y - centerY) * scale + centerY;
    const newScale = currentTransform.k * scale;

    // create the new transform object
    const newTransform = d3.zoomIdentity
      .translate(newX, newY)
      .scale(newScale);

    // run the zoom animation
    svg.transition()
      .call((transition: d3.Transition<SVGGElement, any, any, any>) => {
        transition.call(this._scale.transform, newTransform);
      });
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