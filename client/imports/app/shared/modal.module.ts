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
 */
@Injectable()
export class ModalService {
  private vcRef: ViewContainerRef;
  private injector: Injector;
  public activeInstances: number = 0;

  constructor(private compiler: Compiler) {}

  registerViewContainerRef(vcRef: ViewContainerRef): void {
    this.vcRef = vcRef;
  }

  registerInjector(injector: Injector): void {
    this.injector = injector;
  }

  create<t>(component: Type<t>, parameters?: Object, module: Type<{}> = AppModule): Observable < ComponentRef < t >> {
    let componentRef$ = new ReplaySubject();
    this.compiler.compileModuleAndAllComponentsAsync(module)
    .then(factory => {
      let componentFactory = factory.componentFactories.filter(item => item.componentType === component)[0];
      const childInjector = ReflectiveInjector.resolveAndCreate([], this.injector);
      let componentRef = this.vcRef.createComponent(componentFactory, 0, childInjector);
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
    return <Observable < ComponentRef < t >>> componentRef$.asObservable();
  }
}

// this is the modal-placeholder, it will container the created modals
@Component({
  selector: 'modal-placeholder',
  template: `<div #modalplaceholder></div>`
})
export class ModalPlaceholderComponent implements OnInit {
  @ViewChild('modalplaceholder', {
    read: ViewContainerRef
  }) viewContainerRef;

  constructor(private modalService: ModalService, private injector: Injector) {

  }
  ngOnInit(): void {
    this.modalService.registerViewContainerRef(this.viewContainerRef);
    this.modalService.registerInjector(this.injector);
  }
}

// These 2 items will make sure that you can annotate
// a modalcomponent with @Modal()
export class ModalContainer {
  hidden: boolean = false;
  destroy: Function;
  componentIndex: number;
  
  closeModal(): void {
    this.hidden = true;
    setTimeout(() => this.destroy(), 300);
  }
}
export function Modal() {
  return function (target) {
    Object.assign(target.prototype, ModalContainer.prototype);
  };
}

// module definition
@NgModule({
  declarations: [ModalPlaceholderComponent],
  exports: [ModalPlaceholderComponent],
  providers: [ModalService]
})
export class ModalModule {}