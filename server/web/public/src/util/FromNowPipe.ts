import {Pipe, bind} from 'angular2/core';
// import * as moment from 'moment';

@Pipe({
    name: 'fromNow'
})
export class FromNowPipe {
    transform(dateString: any, args: Array<any>): string {

        var returnValue: string = "";

        let date: Date = new Date(dateString);
        let now: Date = new Date(Date.now());

        let year =      now.getFullYear()   - date.getFullYear();
        let month =     now.getMonth()      - date.getMonth();
        let days =      now.getDay()        - date.getDay();
        let hours =     now.getHours()      - date.getHours();
        let minutes =   now.getMinutes()    - date.getMinutes();

        if ( year >= 2) {
            return returnValue += "vor " + year + " Jahren";
        }else if ( year >= 1 ) {
            return returnValue = "vor über einem Jahr ";
        } else if ( month >= 2) {
            return returnValue = "vor " + month + " Monaten";
        }else if ( month >= 1) {
            return returnValue = "vor einem Monat";
        }else if ( days >= 2 ) {
            return returnValue = "vor " + days + " Tagen";
        }else if ( days === 1) {
            return returnValue = "vor einem Tag";
        }else if ( hours >= 2) {
            return returnValue = "vor " + hours + " Stunden";
        }else if ( hours === 1) {
            return returnValue = "vor einer Stunde";
        }else if ( minutes >= 2) {
            return returnValue = "vor " + minutes + " Minuten";
        }if ( minutes === 1) {
            return returnValue = "vor einer Minute";
        }else {
            return returnValue = "grade eben";
        }
    }
}
