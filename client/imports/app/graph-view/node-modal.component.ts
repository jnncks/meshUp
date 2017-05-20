import { Component, OnInit, AfterViewInit, OnChanges, SimpleChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import * as d3 from 'd3';
import { Html5Entities } from 'html-entities';

import { GraphViewService } from './graph-view.service';
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
export class NodeModalComponent implements OnInit, AfterViewInit, OnChanges{
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
  @Input() openInExplorationMode: boolean = false;
  node: Node;
  nodesLeft: Node[];
  nodesRight: Node[];
  explorationMode: boolean = false;
  private _nodeRadius: number = 100;
  private _htmlEntities: Html5Entities;
  private _resizeHandler: Subscription;
  private _nodeFadeTransition: d3.Transition<any, any, any, any>;
  
  /**
   * Creates an instance of the NodeModalComponent.
   * 
   * @constructor
   * @param {GraphViewService} _graphViewService  The GraphViewService.
   */
  constructor(private _graphViewService: GraphViewService) {
    this._htmlEntities = new Html5Entities();
    this._nodeFadeTransition = d3.transition(null).duration(500);
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

    if (this.openInExplorationMode)
      setTimeout(() =>  this.toggleExplorationMode(), 50);
  }

  /**
   * Handles input changes.
   * 
   * @method ngOnChanges
   * @param  {SimpleChanges} changes An event of changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.graph && this.explorationMode) {
      if ((changes.graph.previousValue === undefined ||
        changes.graph.previousValue === null) &&
        changes.graph.currentValue) {
          this.sortNodes();
          setTimeout(() => this.displayAdjacentNodes(), 50);
        }
    }
  }

  /**
   * Displays or hides the adjacent nodes beneath the modal.
   * 
   * @method toggleExplorationMode
   */
  toggleExplorationMode(): void {
    if (!this.explorationMode) {
      this.explorationMode = !this.explorationMode;

      // wait 50ms (take class changes into account!)
      setTimeout(() => this.displayAdjacentNodes(), 50);
    } else {
      this.hideAdjacentNodes();

      setTimeout(() =>
        this.explorationMode = !this.explorationMode, 300);
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
    
    if (!this._nodeContainerLeft)
      return;

    const containerLeft = this._nodeContainerLeft.nativeElement;

    const height = containerLeft.clientHeight;
    const maxNodes = Math.floor(height / (2 * this._nodeRadius));

    if (this.nodesLeft.length) {
      // display left
      setTimeout(() => {
        this.displayNodes(this._nodeContainerLeft,
          this.nodesLeft.slice(0, maxNodes));
        this.displayEdges(this._nodeContainerLeft);
      });
    }

    if (this.nodesRight.length ||
      (this.nodesLeft && this.nodesLeft.length > maxNodes)) {
      // use a temporary array for the right nodes
      let nodesRight: Node[] = [];

      if (this.nodesLeft && this.nodesLeft.length > maxNodes &&
        this.nodesRight && this.nodesRight.length) {
        // add leftover nodes from the left side to the right side's nodes
        nodesRight = this.nodesRight
          .concat(this.nodesLeft
            .slice(maxNodes)
            .reverse());
      } else if (this.nodesLeft && this.nodesLeft.length > maxNodes) {
        // use only the leftover nodes from the left
        nodesRight = this.nodesLeft
          .slice(maxNodes)
          .reverse();
      } else {
        // there are no leftover nodes from the left
        nodesRight = this.nodesRight;
      }

      // display right
      setTimeout(() => {
        this.displayNodes(this._nodeContainerRight, nodesRight);
        this.displayEdges(this._nodeContainerRight, -1);
      });
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

    const height = containerAttributes.height;
    const maxNodes = Math.floor(height / (2 * this._nodeRadius));

    // basic svg and element groups setup
    const svg = d3.select(element)
      .append<SVGElement>('svg')
      .attr('style', `height: ${height}px;`);

    const containerGroup = svg.append<SVGGElement>('g')
      .attr('class', 'container-group')
      .style('opacity', 0);
    
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

    const width = svg.node().getBoundingClientRect().width;

    // append visible nodes
    if (visibleNodes.length > 1) {
      const heightPerNode = height / (hiddenNodes ? maxNodes : visibleNodes.length);
      
      visibleNodes.forEach((node: Node, i: number) => {
        this.appendNode(nodeGroup, node, width / 2,
          heightPerNode / 2 + i * heightPerNode);
      });

      // handle non-displayed nodes
      if (hiddenNodes && hiddenNodes.length) {
        const moreNodesElement = 
        this.appendMoreNodesElement(container, hiddenNodes);
      
        moreNodesElement
          .attr('style', `height: ${heightPerNode}px;`)
          .style('opacity', 0);

        moreNodesElement.transition(this._nodeFadeTransition)
          .style('opacity', 1);
      }
    } else if (visibleNodes.length > 0) {
      this.appendNode(nodeGroup, visibleNodes[0], width / 2, height / 2);
    }

    // scale the node group down if the group's width
    // is smaller than the node's width
    if (width < 2 * this._nodeRadius) {
      this.scaleNodeContainer(container);
    }

    // fade the nodes smoothly in
    containerGroup.transition(this._nodeFadeTransition)
      .style('opacity', 1);
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

    const moreNodesContainer = d3.select(element).select('div.more-nodes');

    if (!moreNodesContainer.empty())
      edges.append('line')
        .attr('class', 'edge')
        .attr('data-id', 'more-nodes');

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
    if (!container || !container.nativeElement)
      return;

    const element = container.nativeElement;
    const width: number = element.clientWidth;
    const height: number = element.clientHeight;

    d3.select(element).select('svg')
      .attr('style', `height: ${height}px;`);

    return { width: width, height: height };
  }

  /**
   * Updates the coordinates of the nodeContainer's nodes and their contents.
   * 
   * @method updateNodePositions
   * @param {ElementRef} container A reference to the nodeContainer.
   */
  updateNodePositions(container: ElementRef): void {
    if (!container || !container.nativeElement)
      return;

    const element = container.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const containerGroup = svg.select('g.container-group');
    const nodeGroup = containerGroup.select('g.nodes');

    const width = svg.node().getBoundingClientRect().width;

    nodeGroup.selectAll('g.node')
      .each((d: undefined, i: number, g: Element[]) => {
        const node = d3.select(g[i]);
        const circle = node.select('circle');

        // calculate the difference to the previous position
        const dx = width / 2 - Number(circle.attr('cx'));

        // update the circle
        circle
          .attr('cx', width / 2);

        // update the positions of all text elements
        node.selectAll('text')
          .each((d: undefined, i: number, g: Element[]) => {
            const text = d3.select(g[i]);
            const oldX = Number(text.attr('x'));
            text.attr('x', oldX + dx);
          })

        // update the position of other button elements (non-text elements)
        node.selectAll('rect')
          .each((d: undefined, i: number, g: Element[]) => {
            const rect = d3.select(g[i]);
            const oldX = Number(rect.attr('x'));
            rect.attr('x', oldX + dx);
          })
        node.selectAll('use')
          .each((d: undefined, i: number, g: Element[]) => {
            const use = d3.select(g[i]);
            const oldX = Number(use.attr('x'));
            use.attr('x', oldX + dx);
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
    if (!container || !container.nativeElement)
      return;

    const element = container.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const containerGroup = svg.select('g.container-group');
    const nodes = containerGroup.select('g.nodes');
    const edges = containerGroup.select('g.edges');

    // calculate some values required for x2 and y2
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
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

    // handle the edge of a moreNodesContainer
    const moreNodesContainer =
      d3.select(element).select<HTMLDivElement>('div.more-nodes');

    if (!moreNodesContainer.empty()) {
      const boundingRect = moreNodesContainer.node().getBoundingClientRect()
      const x = width / 2;
      const y = height + boundingRect.height / 2;

      const edge = edges.selectAll('line.edge')
        .filter((d: undefined, i: number, g: Element[]) => {
            return d3.select(g[i]).attr('data-id') === 'more-nodes';
          }).node();
      
      if (edge)
        // update the edge
        d3.select(edge)
          .attr('x1', x)
          .attr('y1', y)
          .attr('x2', x + dx)
          .attr('y2', midY);
    }
  }

  /**
   * Rescale the given nodeContainer so that it fits even when there's less
   * horizontal space than twice the node's radius.
   * 
   * @method scaleNodeContainer
   * @param {ElementRef} container A reference to the nodeContainer.
   */
  scaleNodeContainer(container: ElementRef): void {
    if (!container || !container.nativeElement)
      return;

    const element = container.nativeElement;
    const svg = d3.select(element).select<SVGElement>('svg');
    const containerGroup = svg.select('g.container-group');

    // reset the current transform
    containerGroup.attr('transform', d3.zoomIdentity.toString());

    // get the container's width and height
    const width: number = svg.node().getBoundingClientRect().width;
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

    // set up the navigation button
    const button = this.appendNodeButton(newNode, cx, cy);
    button.on('click', () => this.navigateTo(node));

    return newNode;
  }

  /**
   * Appends the moreNodesElement with the nodes as children to the given container.
   * 
   * @method appendMoreNodesElement
   * @param {ElementRef} container A reference to the nodeGroup.
   * @param {Node[]} nodes The nodes to display in the moreNodes element.
   * @returns {d3.Selection<HTMLDivElement, any, any, any>} A reference to the moreNodesElement.
   */
  appendMoreNodesElement(container: ElementRef, nodes: Node[]):
    d3.Selection<HTMLDivElement, any, any, any> {
    if (! nodes || !nodes.length)
      return;

    const HTMLTagsRegEx = /<[^>]+>/ig // RegEx for identifying HTML tags
    const iconUrl = 'icons/svg-sprite-navigation-symbol.svg#ic_arrow_forward_24px';
    const moreNodesElement = d3.select(container.nativeElement)
      .append<HTMLDivElement>('div')
        .attr('class', 'more-nodes');

    moreNodesElement
      .append('div')
      .attr('class', 'title')
      .html('weitere verknüpfte Inhalte');

    const list = moreNodesElement
      .append<HTMLUListElement>('ul');

    nodes.forEach((node: Node) => { // append a list element for each node
      const linkContainer = list
        .append('li')
          .append('div')
          .attr('class', 'link');

      linkContainer.append('svg')
        .append('svg:use')
        .attr('xlink:href', iconUrl);

      linkContainer.append('span')
        .html(this._htmlEntities.decode(node.title)
        .replace(HTMLTagsRegEx,' '));

      linkContainer.on('click', () => this.navigateTo(node));
    });

    return moreNodesElement;
  }

  /**
   * Appends a button to the passed group 'node' and returns a reference to it.
   * 
   * @method appendNodeButton
   * @param  {d3.Selection<SVGGElement, any, any, any>} nodeGroup The group to which the button will be appended.
   * @param  {string} cx The x-coordinate of the node.
   * @param  {string} cy The y-coordinate of the node.
   * @return {d3.Selection<SVGGElement, any, any, any>} The button group.
   */
  appendNodeButton(nodeGroup: d3.Selection<SVGGElement, any, any, any>,
    cx: number, cy: number): d3.Selection<SVGGElement, any, any, any> {
    const button = nodeGroup.append<SVGGElement>('svg:g')
      .attr('class', 'button-group');

    const iconUrl = 'icons/svg-sprite-navigation-symbol.svg#ic_arrow_forward_24px';
    const label = 'öffnen';
    const y = cy + this._nodeRadius - 40;

    // add a rect for the button background
    const buttonBg = button.append('svg:rect')
      .attr('y', y)
      .attr('height', '44')
      .attr('rx', '22');
    // add the icon
    const buttonIcon = button.append('svg:use')
      .attr('xlink:href', iconUrl)
      .attr('y', y + 3)
      .attr('width', 36)
      .attr('height', 36);

    // add the button label
    const buttonLabel = button.append<SVGTextElement>('svg:text')
      .attr('class', 'button__label')
      .attr('y', y + 32)
      .text(label);

    // finally set the attributes according to the text width
    const labelBoundings: SVGRect = buttonLabel.node().getBBox();
    const buttonWidth = 64 + labelBoundings.width;
    buttonBg
      .attr('x', cx - buttonWidth / 2)
      .attr('width', buttonWidth);
    buttonIcon
      .attr('x', cx - buttonWidth / 2 + 6);
    buttonLabel
      .attr('x', cx - buttonWidth / 2 + 48);
      
    return button;
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
   * unsubscribes from the window resize event.
   * 
   * @method hideAdjacentNodes
   * @return {d3.Transition<any, any, any, any>} A transition object.
   */
  hideAdjacentNodes(): d3.Transition<any, any, any, any> {
    // select all child elements of the containerGroups
    const containerLeft = d3.select(this._nodeContainerLeft.nativeElement)
      .selectAll('*')
    const containerRight = d3.select(this._nodeContainerRight.nativeElement)
      .selectAll('*')

    // fade out the nodes
    const transitionLeft = containerLeft
      .transition(this._nodeFadeTransition)
        .style('opacity', 0)
    const transitionRight = containerRight
      .transition(this._nodeFadeTransition)
        .style('opacity', 0)

    // remove the elements from the DOM once the transition has ended
    transitionLeft
      .on('end', () => containerLeft.remove());
    transitionRight
      .on('end', () => containerRight.remove()); 

    // remove the window resize subscription
    this._resizeHandler.unsubscribe();

    // return one of the transitions for event handling
    return transitionLeft;
  }

  /**
   * Changes the currently focused node and, therefore, the modal's content.
   * 
   * @method navigateTo
   * @param {Node} node The node which will be focused.
   */
  navigateTo(node: Node) {
    // request a zoom transition to the new node
    this._graphViewService.focusOnNode(node, 150);

    // close this modal as a new modal will be opend after the transition
    this.close();
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
  close(event?: Event): void {
    if (event && event.target && event.target['id'] !== 'nodeModal')
      return;

    this.closeModal();
  }
}