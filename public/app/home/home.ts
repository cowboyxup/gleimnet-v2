import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Router} from "angular2/router";

import {Http} from "angular2/http";
import {Headers} from "angular2/http";
import {Response} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';

import {contentHeaders} from "../common/headers";
import {autKey} from "../common/consts";

@Component({
    selector: 'Home',
    templateUrl: './app/home/home.html'
})

export class Home implements OnInit{

    http: Http;
    router: Router;
    timeline:Timeline;
    messages:Messages[];
    friends:Friend[];
    user = new User();

    constructor(public router: Router, public http: Http) {
        this.router = router;
        this.http = http;
    }

    //ngOnInit() {
    //
    //    var headers = new Headers();
    //    headers.append('Content-Type', 'application/json');
    //    var basicAuth =  localStorage.getItem('AuthKey');
    //    //headers.append('WWW-Authenticate',basicAuth);
    //
    //    this.http.get('app/testdata/person', {headers })
    //        .map(response =>  response.json())
    //        .subscribe(response => {
    //            this.getResponse = response;
    //            console.log(this.timeline);
    //
    //            }
    //        );
    //}

    ngOnInit() {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        this.http.get('app/testdata/person', {headers })
            .map((res: Response) => res.json())
            .subscribe(
                (res:User) => {
                    this.user = res;
                    this.friends = this.user.friends;
                    console.log(this.user.friends);
                }
            );

        this.http.get('app/testdata/timeline', {headers })
            .map((res: Response) => res.json())
            .subscribe(
                (res:Timeline) => {
                    this.messages = res.messages;
                    //console.log(this.messages);
                }
            );
    }
}

class User{
    firstName:string;
    lastName:string;
    birthday:string;
    information:string;
    friends:Friend[];
}

interface Friend{
    _id: string;
    lastName:string;
}

interface Timeline{
    _id:string;
    messages:Messages[];
}

interface Messages{
    _id:string;
    author:string;
    content:string;
    comments:Comment[];
}

interface Comment{
    _id:string;
    author:string;
    content:string;
}
