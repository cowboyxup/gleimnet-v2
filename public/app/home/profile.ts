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

export class Profile implements OnInit{

    http: Http;
    router: Router;
    routeParams:RouteParams;

    timeline:Timeline;
    messages:Messages[];
    friends:Friend[];


    user = new User();
    username:string;
    timelinepath = 'api/timeline/';

    constructor(public router: Router,
                private routeParams:RouteParams,
                public http: Http,) {
        this.router = router;
        this.http = http;
        this.routeParams = routeParams;
        this.username = this.routeParams.get('id');
        this.timelinepath +=  this.username;
    }

    ngOnInit() {
        this.loadProfilInfos();
        this.loadTimeline();

    }

    loadProfilInfos(){
        var headers = this.headers();
        this.http.get('api/users/username/' + this.username, {headers })
            .map((res: Response) => res.json())
            .subscribe(
                (res:User) => {
                    this.user = res;
                    this.friends = this.user.friends;
                    console.log(this.user.friends);
                }
            );
    }


    loadTimeline(){
        var headers = this.headers();

        this.http.get(this.timelinepath, {headers })
            .map((res: Response) => res.json())
            .subscribe(
                (res:Timeline) => {
                    this.messages = res.messages;
                    //console.log(this.messages);
                }
            );
    }

    postNewPosting(content:string){

        let body = JSON.stringify({content });

        this.http.post(this.timelinepath, body, { headers: this.headers() })
            .map(response =>  {

            })
            .subscribe(
                response => {
                    this.loadTimeline();
                },
                error => {

                }
            );
    }

    commentOnPosting(content:string, postId:string){
        let body = JSON.stringify({content });

        this.http.post('api/timeline/message/' + postId, body, { headers: this.headers() })
            .map(response =>  {
            })
            .subscribe(
                response => {
                    this.loadTimeline();
                },
                error => {
                    //this.message = error.json().message;
                    //this.error = error
                }
            );
    }

    headers(){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var basicAuth =  localStorage.getItem('AuthKey');
        headers.append('Authorization',basicAuth);

        return headers;
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
