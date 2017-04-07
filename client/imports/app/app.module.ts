import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

/* Components */
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NavBarComponent } from './navbar/navbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NetComponent } from './net/net.component';
import { GraphComponent } from './net/graph.component';

/* Services */
import { AuthenticationService } from './shared/authentication.service';
import { DashboardService } from './dashboard/dashboard.service';
import { NetService } from './net/net.service';

/* Pipes */
import { RouteWithNamePipe } from './shared/route-with-name.pipe';

@NgModule({
  /* Components, Pipes, Directives */
  declarations: [
    AppComponent,
    LoginComponent,
    NavBarComponent,
    DashboardComponent,
    NetComponent,
    GraphComponent,
    RouteWithNamePipe
  ],
  /* Entry Components */
  entryComponents: [
    AppComponent
  ],
  /* Providers */
  providers: [
    AuthenticationService,
    DashboardService,
    NetService
  ],
  /* Modules */
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: '',
        pathMatch: 'full',
        component: LoginComponent,
        data: {
          name: 'Anmelden'
        }
      },
      //  {
      //   path: '',
      //   redirectTo: '/dashboard',
      //   pathMatch: 'full',
      // },
      {
        path: 'home',
        component: DashboardComponent,
        data: {
          name: 'Home'
        }
      },
      {
        path: 'net/:id',
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
