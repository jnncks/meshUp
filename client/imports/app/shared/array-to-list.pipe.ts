import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns an array as a string with the array entries
 * being separated by commas.
 * 
 * @class ArrayToListPipe
 * @implements {PipeTransform}
 */
@Pipe({name: 'arrayToList'})
export class ArrayToListPipe implements PipeTransform {

  /**
   * Joins the array entries to a comma-separated string.
   * 
   * @method transform
   * @param {string[]} array An array of strings to transform.
   * @returns {string} 
   */
  transform(array: string[]): string {
    if (!array)
      return;
      
    return array.join(', ');
  }
}