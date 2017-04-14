import {
  NgModule
} from '@angular/core';
import {
  FormsModule, ReactiveFormsModule
} from '@angular/forms';
import {
  BrowserModule
} from '@angular/platform-browser';
import {
  RouterModule
} from '@angular/router';

/* Components */
import {
  AppComponent
} from './app.component';
import {
  LoginComponent
} from './login/login.component';
import {
  NavBarComponent
} from './navbar/navbar.component';
import {
  UserMenuComponent,
  MenuPanelComponent,
  ProfileButtonComponent,
  LogoutModalComponent
} from './navbar/user-menu';
import {
  DashboardComponent,
  DashboardCategoryComponent,
  DashboardCardComponent,
  DashboardNewGraphComponent
} from './dashboard';
import {
  NetComponent
} from './net/net.component';
import {
  GraphComponent
} from './net/graph.component';
import {
  InfoGraphSettingsModal
} from './shared/info-graph-settings-modal.component';

/* Services */
import {
  AuthService
} from './shared/auth.service';
import {
  AuthGuard
} from './shared/auth-guard';
import {
  DashboardService
} from './dashboard/dashboard.service';
import {
  InfoGraphService
} from './shared/info-graph.service';
import {
  NetService
} from './net/net.service';

/* Pipes */
import {
  RouteWithNamePipe
} from './shared/route-with-name.pipe';
import {
  ArrayToListPipe
} from './shared/array-to-list.pipe';

/* Modules */
import {
  ModalModule
} from './shared/modal.module';

@NgModule({
  /* Components, Pipes, Directives */
  declarations: [
    AppComponent,
    LoginComponent,
    NavBarComponent,
    MenuPanelComponent,
    ProfileButtonComponent,
    LogoutModalComponent,
    InfoGraphSettingsModal,
    UserMenuComponent,
    DashboardComponent,
    DashboardCategoryComponent,
    DashboardCardComponent,
    DashboardNewGraphComponent,
    NetComponent,
    GraphComponent,
    RouteWithNamePipe,
    ArrayToListPipe
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
    InfoGraphService,
    NetService
  ],
  /* Modules */
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    RouterModule.forRoot([{
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
        path: 'graph/:id',
        component: NetComponent,
        data: {
          name: 'Graphview'
        },
        canActivate: [
          AuthGuard
        ]
      }
    ])
  ],
  /* Main Component */
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {}
}