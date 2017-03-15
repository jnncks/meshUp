import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

/* Components */
import { AppComponent } from './app.component';
import { NavBarComponent } from './navbar/navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NetComponent } from './net/net.component';

/* Services */
import { DashboardService } from './dashboard/dashboard.service';

/* Pipes */
import { RouteWithNamePipe } from './shared/route-with-name.pipe';

@NgModule({
  /* Components, Pipes, Directives */
  declarations: [
    AppComponent,
    NavBarComponent,
    DashboardComponent,
    NetComponent,
    RouteWithNamePipe
  ],
  /* Entry Components */
  entryComponents: [
    AppComponent
  ],
  /* Providers */
  providers: [
    DashboardService
  ],
  /* Modules */
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
  /* Main Component */
  bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor() {

  }
}
