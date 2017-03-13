import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

import { DemoComponent } from './demo/demo.component';
import { DemoDataService } from './demo/demo-data.service';

import { NavBarComponent } from './navbar/navbar.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardService } from './dashboard/dashboard.service';

import { NetComponent } from './net/net.component';

import { RouteWithNamePipe } from './shared/route-with-name.pipe';

@NgModule({
  // Components, Pipes, Directive
  declarations: [
    AppComponent,
    DemoComponent,
    NavBarComponent,
    DashboardComponent,
    NetComponent,
    RouteWithNamePipe
  ],
  // Entry Components
  entryComponents: [
    AppComponent
  ],
  // Providers
  providers: [
    DemoDataService,
    DashboardService
  ],
  // Modules
  imports: [
    BrowserModule,
    RouterModule.forRoot([
       {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          name: 'Dashboard'
        }
      },
      {
        path: 'net',
        component: NetComponent,
        data: {
          name: 'Netview'
        }
      }
    ])
  ],
  // Main Component
  bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor() {

  }
}
