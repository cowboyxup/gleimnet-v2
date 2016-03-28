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

        var timeDiff = Math.abs(now.getTime() - date.getTime());

        let year =      Math.ceil(timeDiff / (1000 * 3600 * 24 * 365)) - 1;
        let month =     Math.ceil(timeDiff / (1000 * 3600 * 24 * 30)) - 1;
        let days =      Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1;

        let hours =     Math.ceil(timeDiff / (1000 * 3600)) - 1;
        let minutes =   Math.ceil(timeDiff / (1000 * 60)) - 1;

        // returnValue +=  year + " " + month  + " " + days  + " " + hours  + " " + minutes  + " ";

        if ( year >= 2) {
            return returnValue += "vor " + year + " Jahren";
        }else if ( year >= 1 ) {
            return returnValue += "vor über einem Jahr ";
        } else if ( month >= 2) {
            return returnValue += "vor " + month + " Monaten";
        }else if ( month >= 1) {
            return returnValue += "vor einem Monat";
        }else if ( days >= 2 ) {
            return returnValue += "vor " + days + " Tagen";
        }else if ( days >= 1) {
            return returnValue += "vor einem Tag";
        }else if ( hours >= 2) {
            return returnValue += "vor " + hours + " Stunden";
        }else if ( hours === 1) {
            return returnValue += "vor einer Stunde";
        }else if ( minutes >= 2) {
            return returnValue += "vor " + minutes + " Minuten";
        }if ( minutes === 1) {
            return returnValue += "vor einer Minute";
        }else {
            return returnValue += "grade eben";
        }
    }
}
