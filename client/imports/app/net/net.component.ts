import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';

import { NetService } from './net.service';

import { InfoNet, InfoNetMeta} from '../../../../both/models';

import template from './net.component.html';
import style from './net.component.scss';

@Component({
  selector: 'net',
  template,
  styles: [ style ]
})
export class NetComponent implements OnInit {
  net: Observable<InfoNet>;
  netMetaId: Mongo.ObjectID;

  constructor(private _route: ActivatedRoute, private _router: Router, private _netService: NetService) {
  }
  
  ngOnInit() {
    this._route.params
      .subscribe((params: Params) => {
        this.net = this._netService.getInfoNet(params.id)
      });
  }
}
