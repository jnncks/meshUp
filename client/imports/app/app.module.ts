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
import {
  TinymceModule
} from 'angular2-tinymce';

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
  GraphViewComponent,
  GraphComponent,
  NodeModalComponent,
  NodeEditModalComponent
} from './graph-view';
import {
  InfoGraphSettingsModalComponent
} from './shared/info-graph-settings-modal.component';
import {
  InfoGraphCreationModalComponent
} from './shared/info-graph-creation-modal.component';

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
  GraphViewService
} from './graph-view';

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
    InfoGraphSettingsModalComponent,
    InfoGraphCreationModalComponent,
    UserMenuComponent,
    DashboardComponent,
    DashboardCategoryComponent,
    DashboardCardComponent,
    DashboardNewGraphComponent,
    GraphViewComponent,
    GraphComponent,
    NodeModalComponent,
    NodeEditModalComponent,
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
    GraphViewService
  ],
  /* Modules */
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    TinymceModule.withConfig({
      language: 'de',
      menubar: false,
      elementpath: false,
      insert_toolbar: 'image',
      style_formats: [
        {title: 'Paragraph', block: 'p'},
        {title: 'Überschrift 1', block: 'h2'},
        {title: 'Überschrift 2', block: 'h3'},
        {title: 'Überschrift 3', block: 'h4'},
        {title: 'Überschrift 4', block: 'h5'}
      ],
      toolbar: 'undo redo copy paste | styleselect | bold italic | lists | hr link image',
      body_class: 'meshup-tinymce',
      content_css: '/assets/tinymce/skins/custom/tinymce-overwrites.css',
      skin: 'custom'
    }),
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
        path: 'graph/:id/:mode',
        component: GraphViewComponent,
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