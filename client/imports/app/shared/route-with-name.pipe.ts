import { Pipe, PipeTransform } from '@angular/core';
import { Route } from '@angular/router';

/**
 * Excludes routes without a name in the data property.
 * 
 * e.g. `{ path: 'home', component: HomeComponent, data: { name: 'Home' } }`
 * will be kept in the array, whereas `{ path: '**', redirectTo: '/home' }`
 * will be filtered from the array.
*/
@Pipe({name: 'routeWithName'})
export class RouteWithNamePipe implements PipeTransform {
  transform(routes: Route[]) {
    return routes.filter((route) => route.data);
  }
}