import { Injectable } from '@angular/core';
import { ObservableCursor } from 'meteor-rxjs';
import { Demo } from '../../../../both/models/demo.model';
import { DemoCollection } from '../../../../both/collections/demo.collection';

@Injectable()
export class DashboardService {
  private data: ObservableCursor<Demo>;

  constructor() {
    this.data = DemoCollection.find({});
  }

  public getData(): ObservableCursor<Demo> {
    return this.data;
  }

  public getCategories() {
    return [
      {
        name: 'Vorlesungen',
        description: 'Alle Netze, die mit Vorlesungen zu tun haben.',
        items: [
          {
            name: 'Einführung in die Medieninformatik',
            description: 'Was gehört alles zum Medieninformatik-Studium dazu?'
          },
          {
            name: 'Software-Ergonomie',
            description: 'Grundlagen der menschzentrierten Softwareentwicklung.'
          }
        ]
      },
      {
        name: 'Privat',
        description: 'Meine privaten Netze.'
      }
    ];
  }
}
