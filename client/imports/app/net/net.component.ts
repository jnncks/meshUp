import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';

import { NetService } from './net.service';

import { InfoGraph, InfoGraphMeta} from '../../../../both/models';

import template from './net.component.html';
import styleUrl from './net.component.scss';

@Component({
  selector: 'net',
  template,
  styles: [ styleUrl ]
})
export class NetComponent implements OnInit {
  private _graph: Observable<InfoGraph>;
  private _graphMetaId: Mongo.ObjectID;

  constructor(private _route: ActivatedRoute, private _router: Router, private _netService: NetService) {
  }
  
  ngOnInit() {
    this._route.params
      .subscribe((params: Params) => {
        this._graph = this._netService.getInfoGraph(params.id).zone();
      });
  }
}
