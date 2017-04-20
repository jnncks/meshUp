import { Pipe, PipeTransform } from '@angular/core';
import { Route } from '@angular/router';

/**
 * Excludes routes without a name in the data property.
 * 
 * e.g. `{ path: 'home', component: HomeComponent, data: { name: 'Home' } }`
 * will be kept in the array, whereas `{ path: '**', redirectTo: '/home' }`
 * will be filtered from the array.
 * 
 * @class RouteWithNamePipe
 * @implements {PipeTransform}
 */
@Pipe({name: 'routeWithName'})
export class RouteWithNamePipe implements PipeTransform {

  /**
   * Filters the routes.
   * 
   * @method transform
   * @param {Route[]} routes 
   * @return {Route[]} The filtered routes.
   */
  transform(routes: Route[]): Route[] {
    return routes.filter((route) => route.data);
  }
}