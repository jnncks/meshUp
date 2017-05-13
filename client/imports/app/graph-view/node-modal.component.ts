import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import * as d3 from 'd3';
import { Html5Entities } from 'html-entities';

import { Modal } from '../shared/modal.module';
import { InfoGraph, Node, Edge } from '../../../../both/models';

import template from './node-modal.component.html';
import styleUrl from './node-modal.component.scss';

/**
 * A modal which displays the content of a node in detail.
 * Adjacent modals may be displayed for a more immersive exploration.
 * 
 * @class NodeModalComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 */
@Component({
  selector: 'node-modal',
  template,
  styles: [styleUrl],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        animate('0.125s ease', keyframes([
          style({opacity: 0}),
          style({opacity: 1})
        ]))
      ]),
      transition(':leave', [
        animate('0.125s ease', keyframes([
          style({opacity: 1}),
          style({opacity: 0})
        ]))
      ])
    ])
  ]
})
@Modal()
export class NodeModalComponent implements OnInit, AfterViewInit{
  // properties inherited from the ModalContainer
  destroy: Function;
  closeModal: Function;
  hidden: boolean;

  // custom properties
  @ViewChild('nodeContainerLeft') private _nodeContainerLeft: ElementRef;
  @ViewChild('nodeContainerRight') private _nodeContainerRight: ElementRef;
  @ViewChild('modalDialog') private _modalDialog: ElementRef;
  @Input() graph: InfoGraph;
  @Input() currendNodeId: string;
  node: Node;
  nodesLeft: Node[];
  nodesRight: Node[];
  explorationMode: boolean = false;
  private _nodeRadius: number = 100;
  private _htmlEntities: Html5Entities;
  private _resizeHandler: Subscription;
  
  /**
   * Creates an instance of the NodeModalComponent.
   * 
   * @constructor
   */
  constructor() {
    this._htmlEntities = new Html5Entities();
  }

  /**
   * Called when the component is initialized.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
    if (this.graph && this.graph.nodes)
      this.node = this.graph.nodes.filter((node: Node) =>
        node._id === this.currendNodeId)[0];

    // TODO: get the creator's name
  }

  /**
   * Called after the view has been initialized.
   * Sorts the graphs nodes.
   * 
   * @method ngOnInit
   */
  ngAfterViewInit(): void {
    this.sortNodes()
  }

  /**
   * Displays or hides the adjacent nodes beneath the modal.
   * 
   * @method toggleExplorationMode
   */
  toggleExplorationMode(): void {
    this.explorationMode = !this.explorationMode;
    
    if (this.explorationMode) {
      // wait a tick (take class changes into account!)
      setTimeout(() => this.displayAdjacentNodes());
    } else {
      this.hideAdjacentNodes();
    }
  }

  /**
   * Sorts the nodes by their coordinates.
   * (relative to the currently viewed node)
   * 
   * @method sortNodes
   */
  sortNodes(): void {
    if (!this.graph || !this.graph.nodes || this.graph.nodes.length <= 1)
      return;
    
    // get all relevant edges
    const edges = this.graph.edges
      .filter((edge: Edge) =>
        edge.source === this.currendNodeId ||
        edge.target === this.currendNodeId
      );

    // filter the currently displayed node and all non-adjacent nodes
    const nodes = this.graph.nodes
      .filter((node: Node) => node._id !== this.currendNodeId)
      .filter((node: Node) => {
        const index = edges.findIndex((edge: Edge) => {
          return (edge.source === node._id || edge.target === node._id);
        });
        return index >= 0; // the index is -1 if there is no edge for the node
      });

    // split the nodes in left- and right-sided nodes and sort them within
    // each array by their vertical position (y) in the graph
    this.nodesLeft = nodes.filter(node => node.x <= this.node.x)
      .sort((a: Node, b: Node) => a.y - b.y);
    this.nodesRight = nodes.filter(node => node.x > this.node.x)
      .sort((a: Node, b: Node) => a.y - b.y);
  }

  /**
   * Displays all adjacent nodes, distributed into the two nodeGroups.
   * Also appends the edges and subscribes to the windows resize event.
   * 
   * @method displayAdjacentNodes
   */
  displayAdjacentNodes(): void {
    if ((!this.nodesLeft && !this.nodesRight) ||
      (!this.nodesLeft.length && !this.nodesRight.length))
      return;
    
    if (this.nodesLeft.length) {
      // display left
      this.displayNodes(this._nodeContainerLeft, this.nodesLeft);
      this.displayEdges(this._nodeContainerLeft);
    }

    if (this.nodesRight.length) {
      // display right
      this.displayNodes(this._nodeContainerRight, this.nodesRight);
      this.displayEdges(this._nodeContainerRight, -1);
    }

    // handle window resize events
    this._resizeHandler = Observable.fromEvent(window, 'resize')
      .debounceTime(50) // debounce for 50ms
      .subscribe(() => this.handleResize());
  }

  /**
   * Sets the SVG element and group elements up and appends the adjacent nodes.
   * 
   * @method displayNodes
   * @param {ElementRef} container A reference to the nodeGroup.
   * @param {Node[]} nodes The nodes which should be displayed.
   */
  displayNodes(container: ElementRef, nodes: Node[]): void {
    const element = container.nativeElement;

    const containerAttributes: { width: number, height: number } = 
      this.updateNodeContainer(container);

    const width = containerAttributes.width;
    const height = containerAttributes.height;
    const maxNodes = Math.floor(height / (2 * this._nodeRadius));

    // basic svg and element groups setup
    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const containerGroup = svg.append<SVGGElement>('g')
      .attr('class', 'container-group');
    
    const edgeGroup = containerGroup.append<SVGGElement>('svg:g')
      .attr('class', 'edges');
    const nodeGroup = containerGroup.append<SVGGElement>('svg:g')
      .attr('class', 'nodes');

    // declare arrays before subsequently distributing the nodes into these two
    // arrays depending on the maxNodes limit
    let visibleNodes: Node[];
    let hiddenNodes: Node[];

    // split the nodes in two arrays if the maxNodes limit is exceeded
    if (maxNodes < nodes.length) {
      visibleNodes = nodes.slice(0, maxNodes - 1);
      hiddenNodes = nodes.slice(maxNodes);
    } else {
      visibleNodes = nodes;
    }

    // append visible nodes
    if (visibleNodes.length > 1) {
      const heightPerNode = height / visibleNodes.length;
      
      visibleNodes.forEach((node: Node, i: number) => {
        this.appendNode(nodeGroup, node, width / 2,
          heightPerNode / 2 + i * heightPerNode);
      });

      // TODO: handle hiddenNodes!

    } else if (visibleNodes.length > 0) {
      this.appendNode(nodeGroup, visibleNodes[0], width / 2, height / 2);
    }

    // scale the node group down if the group's width
    // is smaller than the node's width
    if (width < 2 * this._nodeRadius) {
      this.scaleNodeContainer(container);
    }
  }

  /**
   * Appends the edges to the edges group of the containerGroup.
   * direction is optional but should be either 1 or -1 if supplied:
   *   direction = 1 -> The Edges spread to the right.
   *   direction = -1 -> The Edges spread to the left.
   * 
   * @method displayEdges
   * @param {ElementRef} container A reference to the containerGroup.
   * @param {number} [direction=1] The direction of the edges.
   */
  displayEdges(container: ElementRef, direction: number = 1): void {
    const element = container.nativeElement;
    const containerGroup = d3.select(element).select('g.container-group');
    const nodes = containerGroup.select('g.nodes');
    const edges = containerGroup.select('g.edges');

    nodes.selectAll('g.node')
      .each((d: undefined, i: number, g: Element[]) => {
        const node = d3.select(g[i]);
        const id = node.attr('data-id');

        // append the edges without setting the coordinates
        edges.append('line')
          .attr('class', 'edge')
          .attr('data-id', id);
      });

    // set the coordinates
    this.updateEdgeCoordinates(container, direction);
  }

  /**
   * Resizes the nodeContainer.
   * 
   * @method updateNodeContainer
   * @param {ElementRef} container A reference to the nodeContainer.
   * @returns {{ width: number, height: number }} 
   */
  updateNodeContainer(container: ElementRef): { width: number, height: number } {
    const element = container.nativeElement;
    const width: number = element.clientWidth;
    const height: number = element.clientHeight;

    d3.select(element).select('svg')
      .attr('width', width)
      .attr('height', height);

    return { width: width, height: height };
  }

  /**
   * Updates the coordinates of the nodeContainer's nodes and their contents.
   * 
   * @method updateNodePositions
   * @param {ElementRef} container A reference to the nodeContainer.
   */
  updateNodePositions(container: ElementRef): void {
    const element = container.nativeElement;
    const containerGroup = d3.select(element).select('g.container-group');
    const nodeGroup = containerGroup.select('g.nodes');

    const width = element.clientWidth;

    nodeGroup.selectAll('g.node')
      .each((d: undefined, i: number, g: Element[]) => {
        const node = d3.select(g[i]);
        const circle = node.select('circle');

        // calculate the difference to the previous position
        const dx = width / 2 - Number(circle.attr('cx'));

        // update the circle
        circle
          .attr('cx', width / 2);

        // update the content's position
        node.selectAll('text')
          .each((d: undefined, i: number, g: Element[]) => {
            const text = d3.select(g[i]);
            const oldX = Number(text.attr('x'));
            text.attr('x', oldX + dx);
          })
      });
  }

  /**
   * Updates the edges coordinates of the given nodeContainer.
   * direction is optional but should be either 1 or -1 if supplied:
   *   direction = 1 -> The Edges spread to the right.
   *   direction = -1 -> The Edges spread to the left.
   * 
   * @method updateEdgeCoordinates
   * @param {ElementRef} container A reference to the nodeContainer.
   * @param {number} [direction=1] The direction of the edges.
   */
  updateEdgeCoordinates(container: ElementRef, direction: number = 1): void {
    const element = container.nativeElement;
    const containerGroup = d3.select(element).select('g.container-group');
    const nodes = containerGroup.select('g.nodes');
    const edges = containerGroup.select('g.edges');

    // calculate some values required for x2 and y2
    const width = element.clientWidth;
    const dx = (width / 2 + this._modalDialog.nativeElement.clientWidth / 2) * direction;
    const midY = this._modalDialog.nativeElement.clientHeight / 2;

    nodes.selectAll('g.node')
      .each((d: undefined, i: number, g: Element[]) => {
        const node = d3.select(g[i]);
        const circle = node.select('circle');
        const id = node.attr('data-id');
        const x = Number(circle.attr('cx'));
        const y = Number(circle.attr('cy'));

        // get the edge related to the node
        const edge = edges.selectAll('line.edge')
          .filter((d: undefined, i: number, g: Element[]) => {
            return d3.select(g[i]).attr('data-id') === id
          }).node();

        if (edge)
          // update the edge
          d3.select(edge)
            .attr('x1', x)
            .attr('y1', y)
            .attr('x2', x + dx)
            .attr('y2', midY);
      });
  }

  /**
   * Rescale the given nodeContainer so that it fits even when there's less
   * horizontal space than twice the node's radius.
   * 
   * @method scaleNodeContainer
   * @param {ElementRef} container A reference to the nodeContainer.
   */
  scaleNodeContainer(container: ElementRef): void {
    const element = container.nativeElement;
    const containerGroup = d3.select(element).select('g.container-group');

    // reset the current transform
    containerGroup.attr('transform', d3.zoomIdentity.toString());

    // get the container's width and height
    const width: number = element.clientWidth;
    const height: number = element.clientHeight;

    // calculate the new scale and translation
    const scale: number = Math.min(width / (2 * this._nodeRadius), 1);
    const left: number = (width - (width * scale)) / 2 / scale;
    const top: number = (height - (height * scale)) / 2 / scale;

    // apply the transformation
    containerGroup
      .attr('transform',
        d3.zoomIdentity
          .scale(scale)
          .translate(left, top)
          .toString());
  }

  /**
   * Appends a new group element with the node's circle and content
   * to the supplied nodeGroup.
   * 
   * @method appendNode
   * @param {d3.Selection<SVGGElement, any, any, any>} nodeGroup A reference to the '.nodes' group element.
   * @param {Node} node The node data.
   * @param {number} cx The node's x-coordinate.
   * @param {number} cy The node's y-coordinate.
   * @returns {d3.Selection<SVGGElement, any, any, any>} 
   */
  appendNode(nodeGroup: d3.Selection<SVGGElement, any, any, any>, node: Node,
    cx: number, cy: number): d3.Selection<SVGGElement, any, any, any> {
    const newNode = nodeGroup
      .append<SVGGElement>('svg:g')
      .attr('class', 'node')
      .attr('data-id', node._id);

    newNode.append('svg:circle')
      .attr('class', 'node__circle')
      .attr('r', this._nodeRadius)
      .attr('cx', cx)
      .attr('cy', cy);

    this.renderNodeContent(newNode, node, cx, cy);

    return newNode;
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
  renderNodeContent(nodeGroup: d3.Selection<SVGGElement, any, any, any>,
    node: Node, cx: number, cy: number): void {
    // define the max amount of lines with their max character amount
    const maxCTitle = [10, 14, 16]; // title lines
    const maxCContent = [36, 35, 33, 32, 27, 18]; // content lines
    const HTMLTagsRegEx = /<[^>]+>/ig // RegEx for identifying HTML tags
    let lines: string[] = [];
    /**
     * add the title
     * 
     * 1. Decode HTML entities.
     * 2. Split the string into an array.
     * 3. Generate the text according to the different line lenghts.
     * 4. Add the text lines as single text elements.
     */ 
    if (node.title) {
      const titleArr = this._htmlEntities.decode(node.title)
        .split(' ');
      lines = this.generateTextLines(titleArr, maxCTitle);

      for (let i = 0; i < lines.length; i++) {
        nodeGroup.append('svg:text')
          .attr('class', 'node__content__title')
          .attr('x', cx - 25)
          .attr('y', cy - 60 + i * 16)
          .text(lines[i]);
      }
    }
    
     /**
     * add the content: similar to adding the title, but also stripping
     * all HTML tags since the content will be added as plain text elements.
     */ 
    if (node.content) {
      const contentArr = this._htmlEntities.decode(node.content)
        .replace(HTMLTagsRegEx,' ')
        .split(' ');
      lines = this.generateTextLines(contentArr, maxCContent);

      for (let i = 0; i < lines.length; i++) {
        nodeGroup.append('svg:text')
          .attr('class', 'node__content__text')
          .attr('x', cx - 95 + Math.pow(1.3 * i, 2))
          .attr('y', cy + i * 16)
          .text(lines[i]);
      }
    }
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
   * Removes the adjacent nodes from the view and
   * unsubscribe from the window resize event.
   * 
   * @method hideAdjacentNodes
   */
  hideAdjacentNodes(): void {
    // remove the svg elements from the DOM
    d3.select(this._nodeContainerLeft.nativeElement)
      .select('svg')
      .remove();
    d3.select(this._nodeContainerRight.nativeElement)
      .select('svg')
      .remove();
    
    // remove the window resize subscription
    this._resizeHandler.unsubscribe();
  }

  /**
   * Updates various sizes and coordinates of the adjacent nodes
   * on window resize.
   * 
   * @method handleResize
   */
  handleResize(): void {
    // update the node container sizes
    this.updateNodeContainer(this._nodeContainerLeft);
    this.updateNodeContainer(this._nodeContainerRight);

    // update the node's positions
    this.updateNodePositions(this._nodeContainerLeft);
    this.updateNodePositions(this._nodeContainerRight);

    // update the edge's coordinates
    this.updateEdgeCoordinates(this._nodeContainerLeft);
    this.updateEdgeCoordinates(this._nodeContainerRight, -1);

    // finally rescale the elements within the containers
    this.scaleNodeContainer(this._nodeContainerLeft);
    this.scaleNodeContainer(this._nodeContainerRight);
  }

  /**
   * Closes the modal.
   * 
   * @method close
   */
  close(event: Event): void {
    if (event && event.target && event.target['id'] !== 'nodeModal')
      return;

    this.closeModal();
  }
}