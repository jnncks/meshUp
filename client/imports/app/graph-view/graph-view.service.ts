import { Injectable, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';

import { InfoGraphService } from '../shared/info-graph.service';

import { InfoGraph, InfoGraphMeta, Node } from '../../../../both/models';
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
  public modeChanged = new EventEmitter<boolean>();

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

    this._graph.first().subscribe((graph: InfoGraph) => {
      let index = graph.nodes.findIndex((n: Node) => n._id === node._id);

      if (index >= 0) {
         graph.nodes[index] = node;
        this._infoGraphService.updateInfoGraph(graph);
      } else {
        console.error('the node\'s ID does not exist! (updateInfoGraphNode)');
      }
    });
  }
}
