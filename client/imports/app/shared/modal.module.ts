import {
  Component,
  NgModule,
  ViewChild,
  OnInit,
  ViewContainerRef,
  Compiler,
  ReflectiveInjector,
  Injectable,
  Injector,
  ComponentRef, Type, Provider
} from '@angular/core';
import {
  Observable,
  Subject,
  BehaviorSubject,
  ReplaySubject
} from 'rxjs';

import { AppModule } from '../app.module';

/**
 * The Modal Service.
 * Creates dynamically modals.
 * 
 * Based on: http://blog.brecht.io/Modals-in-angular2/
 * 
 * @class ModalService
 */
@Injectable()
export class ModalService {
  private _vcRef: ViewContainerRef;
  private _injector: Injector;
  public activeInstances: number = 0;

  /**
   * Creates an instance of the ModalService.
   * 
   * @constructor
   * @param {Compiler} _compiler The Compiler.
   */
  constructor(private _compiler: Compiler) {
  }

  /**
   * Registers the ViewContainer reference.
   * 
   * @method registerViewContainerRef
   * @param {ViewContainerRef} vcRef 
   */
  registerViewContainerRef(vcRef: ViewContainerRef): void {
    this._vcRef = vcRef;
  }

  /**
   * Registers the injector.
   * 
   * @method registerInjector
   * @param {Injector} injector 
   */
  registerInjector(injector: Injector): void {
    this._injector = injector;
  }


  /**
   * Creates a new component and returns an Observable of a reference to it.
   * 
   * @method create<t>
   * @param {Type<t>} component The component (modal) to create in the placeholder.
   * @param {Object} [parameters] Parameters which will be passed to the components inputs.
   * @param {Type<{}>} [module] The parent module; defaults to the AppModule.
   * @returns {Observable <ComponentRef<t>>} A reference to the component.
   */
  create<t>(component: Type<t>, parameters?: Object, module: Type<{}> = AppModule): Observable <ComponentRef<t>> {
    let componentRef$ = new ReplaySubject();

    this._compiler.compileModuleAndAllComponentsAsync(module)
      .then(factory => {
        let componentFactory = factory.componentFactories.filter(item => item.componentType === component)[0];
        const childInjector = ReflectiveInjector.resolveAndCreate([], this._injector);
        let componentRef = this._vcRef.createComponent(componentFactory, 0, childInjector);
        Object.assign(componentRef.instance, parameters); // pass the @Input parameters to the instance
        this.activeInstances++;
        componentRef.instance['componentIndex'] = this.activeInstances;
        componentRef.instance['destroy'] = () => {
          this.activeInstances--;
          componentRef.destroy();
        };
        componentRef$.next(componentRef);
        componentRef$.complete();
      });

    return <Observable<ComponentRef<t>>> componentRef$.asObservable();
  }
}

/**
 * A placeholder component which serves as a container for all created modals.
 * 
 * @class ModalPlaceholderComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'modal-placeholder',
  template: `<div #modalplaceholder></div>`
})
export class ModalPlaceholderComponent implements OnInit {
  @ViewChild('modalplaceholder', {
    read: ViewContainerRef
  }) viewContainerRef;

  /**
   * Creates an instance of the ModalPlaceholderComponent.
   * 
   * @constructor
   * @param {ModalService} modalService The ModalService.
   * @param {Injector} injector The Injector.
   */
  constructor(private modalService: ModalService, private injector: Injector) {

  }

  /**
   * Called when the component is initialized.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
    this.modalService.registerViewContainerRef(this.viewContainerRef);
    this.modalService.registerInjector(this.injector);
  }
}

/**
 * Combine the ModalService and the ModalContainer into a module.
 * 
 * @class ModalModule
 */
@NgModule({
  declarations: [ModalPlaceholderComponent],
  exports: [ModalPlaceholderComponent],
  providers: [ModalService]
})
export class ModalModule {}

/**
 * A modal skeleton with some basic properties.
 * 
 * @class ModalContainer
 */
export class ModalContainer {
  hidden: boolean = false;
  destroy: Function;
  componentIndex: number;
  
  closeModal(): void {
    this.hidden = true;
    setTimeout(() => this.destroy(), 300);
  }
}

/**
 * Allows for the ModalContainer to be used as a decorator (@Modal)
 * to inject the ModalContainer's properties into a class.
 * 
 * @function Modal
 */
export function Modal() {
  return function (target) {
    Object.assign(target.prototype, ModalContainer.prototype);
  };
}