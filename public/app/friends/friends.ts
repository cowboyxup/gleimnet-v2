import {Component} from 'angular2/core';

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';


@Component({
    selector: 'Friends',
    templateUrl: './app/friends/friends.html'
})

export class Friends {
    friends:Friend[];
}