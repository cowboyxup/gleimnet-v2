
import {Pipe, PipeTransform} from 'angular2/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 |  exponentialStrength:10}}
 *   formats to: 1024
 */
@Pipe({name: 'formatedDateFromString'})
export class FormatedDateFromStringPipe implements PipeTransform {

    transform(dateString: string, args: string[]) : string {
        console.log("formatedDateFromString :" + dateString);
        var document;
        if (dateString === null || dateString !== ""  || dateString === undefined) {
            document = '';
        } else {
            var date = new Date(dateString);
            var options = {
                year: "numeric", month: "long",
                day: "numeric"
            };
            document = date.toLocaleDateString('de-de', options);
        }
        return document;
    }
}
