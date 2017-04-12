import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns an array to an string with the array entries
 * being separated by commas.
*/
@Pipe({name: 'arrayToList'})
export class ArrayToListPipe implements PipeTransform {
  transform(array: string[]): string {
    if (!array)
      return;
      
    return array.join(', ');
  }
}