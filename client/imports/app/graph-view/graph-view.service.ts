import { Injectable, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';

import { InfoGraphService } from '../shared/info-graph.service';

import { InfoGraph, InfoGraphMeta, Node, Edge } from '../../../../both/models';
import { InfoGraphCollection, InfoGraphMetaCollection } from '../../../../both/collections';


/**
 * Provides InfoGraph und InfoGraphMeta data.
 * 
 * @class GraphViewService
 */
@Injectable()
export class GraphViewService {
  private _graph: Observable<InfoGraph>;
  private _graphMeta: Observable<InfoGraphMeta>;
  private _isEditing: boolean;
  private _isAddingNode: boolean;
  public modeChanged = new EventEmitter<boolean>();
  public nodeAddingChanged = new EventEmitter<boolean>();

  /**
   * Creates an instance of the GraphViewService.
   * 
   * @param {Router} _router 
   * @constructor
   */
  constructor(private _router: Router, private _infoGraphService: InfoGraphService) {

    // update the current mode on navigation end
    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(event => {
        if (event.url.endsWith('/edit')) {
          this._isEditing = true;
        } else if (event.url.endsWith('/view')) {
          this._isEditing = false;
        }

        this.modeChanged.emit(this._isEditing);
      });
  }

  /**
   * Subscribes to the InfoGraphCollection and assigns an Observable of the
   * requested infoGraph to the private graph object.
   * 
   * @method setCurrentInfoGraph
   * @param  {string} graphMetaId The ID of the related InfoGraphMeta document.
   */
  public setCurrentInfoGraph(graphMetaId): void {
    // set up the subscriptions
    const graphs = MeteorObservable.subscribe('InfoGraphCollection', graphMetaId);
    const graphMetas = MeteorObservable.subscribe('InfoGraphMetaCollection');
    const autorun = MeteorObservable.autorun();

    // update the data whenever there was a change
    Observable.merge(graphs, graphMetas, autorun).subscribe(() => {
      // Observable of the first and only element
      this._graph = InfoGraphCollection.find({metaId: graphMetaId}, {limit: 1})
        .map(graph => graph[0]);
      this._graphMeta = InfoGraphMetaCollection.find({_id: graphMetaId}, {limit: 1})
        .map(graphMeta => graphMeta[0]);
    });
  }

  /**
   * Returns the private graph object, an Observable of the currently
   * assigned infoGraph.
   * 
   * @method getCurrentInfoGraph
   * @returns Observable<InfoGraph>
   */
  public getCurrentInfoGraph(): Observable<InfoGraph> {
    return this._graph;
  }

  /**
   * Handles errors. Currently, the errors are print in the console.
   * 
   * @method _handleError
   * @param  {Error} e The error to handle.
   */
  private _handleError(e: Error): void {
    console.error(e);
  }


  /**
   * Toggles between the editing and viewing mode.
   * 
   * @method toggleMode
   */
  toggleMode(): void {
    let currentRoute: string = this._router.url;
    if (currentRoute.includes('/edit') || currentRoute.includes('/view'))
      currentRoute = currentRoute.substring(0, currentRoute.length - 5);
    
    let isOwner: boolean;
    this.getCurrentGraphMeta().subscribe(meta => {
      if (meta.owner === Meteor.userId())
        isOwner =  true;
      else
        isOwner =  false;
    })
    
    if (!isOwner){
      // the user has no editing permissions
      return;
    }

    if (!this._isEditing) {
      this._router.navigate([currentRoute, 'edit']);
    } else {
      this._router.navigate([currentRoute, 'view']);
    }
  }

  /**
   * Toggles the current editing mode: If nodeAdding is active, the user is
   * currently adding a new node to the graph.
   * 
   * @method toggleNodeAdding
   */
  toggleNodeAdding(): void {
    this._isAddingNode = !this._isAddingNode;
    this.nodeAddingChanged.emit(this._isAddingNode)
  }

  /**
   * Returns the current mode: true if editing, else false.
   * 
   * @method getCurrentMode
   * @return {boolean} current Mode
   */
  getCurrentMode(): boolean {
    return this._isEditing;
  }

  /**
   * Returns an Observable of the infoGraphMeta of the currently active
   * infoGraph of the graphView.
   * 
   * @method getCurrentGraphMeta
   * @return {Observable<InfoGraphMeta>} 
   */
  getCurrentGraphMeta(): Observable<InfoGraphMeta> {
    if (this._graphMeta)
      return this._graphMeta;
  }

  /**
   * Updates a node of the currently active infoGraph (_graph) by passing the
   * graph's data to the updateInfoGraph method of the InfoGraphService.
   * 
   * @method updateInfoGraphNode
   * @param  {Node} node 
   */
  updateInfoGraphNode(node: Node): void {
    if (!this._graph)
      return;

    this._graph.first(graph => graph !== undefined)
      .subscribe((graph: InfoGraph) => {
        const index = graph.nodes.findIndex((n: Node) => n._id === node._id);

        if (index >= 0) {
          graph.nodes[index] = node;
          this._infoGraphService.updateInfoGraph(graph);
        } else {
          console.error('the node\'s ID does not exist! (updateInfoGraphNode)');
        }
      });
  }
  
  /**
   * Adds a new node to the currently active infoGraph (_graph) by passing the
   * graph's data to the updateInfoGraph method of the InfoGraphService.
   * 
   * @method addInfoGraphNode
   * @param {number} [cx] The y-coordinate of the nodes center.
   * @param {number} [cy] The x-coordinate of the nodes center.
   * @param {string} [title] The node's title.
   * @param {string} [content] The node's content.
   * @param {string[]} [tags] The node's tags.
   */
  addInfoGraphNode(cx: number = 0, cy: number = 0, title: string = '',
    content: string = '', tags: string[] = []): void {
    if (!this._graph)
      return;

    this._graph.first(graph => graph !== undefined)
      .subscribe((graph: InfoGraph) => {
        if (!graph.nodes) 
          graph.nodes = [];

        graph.nodes.push({
          _id: Random.id(),
          x: cx,
          y: cy,
          title: title,
          content: content,
          tags: tags,
          creator: Meteor.userId(),
          created: new Date(),
          lastUpdated: new Date()
        });

        this._infoGraphService.updateInfoGraph(graph);
      });
  }

  /**
   * Removes a node of the currently active infoGraph (_graph) by passing the
   * graph's data to the updateInfoGraph method of the InfoGraphService.
   * Additionally removes related edges.
   * 
   * @method removeInfoGraphNode
   * @param  {Node} node The node to remove from the infoGraph.
   */
  removeInfoGraphNode(node: Node): void {
    if (!this._graph)
      return;

    this._graph.first(graph => graph !== undefined)
      .subscribe((graph: InfoGraph) => {
        const index = graph.nodes.findIndex((n: Node) => n._id === node._id);

        if (index >= 0) {
          graph.nodes.splice(index, 1);

          if (graph.edges && graph.edges.length)
            graph.edges = graph.edges.filter(edge =>
              edge.source !== node._id && edge.target !== node._id);
          
          this._infoGraphService.updateInfoGraph(graph);
        } else {
          console.error('the node\'s ID does not exist! (removeInfoGraphNode)');
        }
      });
  }

  /**
   * Adds a new edge to the list of edges by passing the updated graph's data
   * to the updateInfoGraph method of the InfoGraphService.
   * 
   * @method createInfoGraphEdge
   * @param {string} source The source node's ID.
   * @param {string} target The target nodes's ID.
   */
  createInfoGraphEdge(source: string, target: string): void {
    if (!this._graph)
      return;
    
    // don't add an edge when the source is the target
    if (source === target)
      return;

    this._graph.first(graph => graph !== undefined)
      .subscribe((graph: InfoGraph) => {
        if (!graph.edges) 
          graph.edges = [];

        // check for any edges with the same nodes
        const existingEdge = graph.edges.find((edge: Edge) => {
          return (edge.source === source && edge.target === target) ||
                 (edge.source === target && edge.target === source)
        });

        if (existingEdge) {
          return;
        }

        graph.edges.push({
          _id: Random.id(),
          source: source,
          target: target,
          creator: Meteor.userId(),
          created: new Date()
        });

        this._infoGraphService.updateInfoGraph(graph);
      });
  }

  /**
   * Removes an edge of the list of edges by passing the updated graph's data
   * to the updateInfoGraph method of the InfoGraphService. 
   * 
   * @method removeInfoGraphEdge
   * @param {string} id The edge's ID.
   */
  removeInfoGraphEdge(id: string): void {
    if (!id || !this._graph)
      return;

    this._graph.first(graph => graph !== undefined)
      .subscribe((graph: InfoGraph) => {
        if (!graph.edges) 
          return;

        graph.edges = graph.edges.filter((edge: Edge) =>
          edge._id !== id);

        this._infoGraphService.updateInfoGraph(graph);
      });
  }
}
