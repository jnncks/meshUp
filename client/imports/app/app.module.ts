import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

/* Components */
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NavBarComponent } from './navbar/navbar.component';
import { UserMenuComponent, MenuPanelComponent, ProfileButtonComponent } from './navbar/user-menu';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NetComponent } from './net/net.component';
import { GraphComponent } from './net/graph.component';

/* Services */
import { AuthService } from './shared/auth.service';
import { AuthGuard } from './shared/auth-guard';
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
    MenuPanelComponent, 
    ProfileButtonComponent,
    UserMenuComponent,
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
    AuthService,
    AuthGuard,
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
        redirectTo: 'login'
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'home',
        component: DashboardComponent,
        data: {
          name: 'Home'
        },
        canActivate: [
          AuthGuard
        ]
      },
      {
        path: 'net/:id',
        component: NetComponent,
        data: {
          name: 'Netview'
        },
        canActivate: [
          AuthGuard
        ]
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
