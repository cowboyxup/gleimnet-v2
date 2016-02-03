import {Component} from 'angular2/core';

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Http} from "angular2/http";
import {Router} from "angular2/router";

import {contentHeaders } from '../common/headers';
import {autKey, authHeader } from '../common/consts';
import {Response} from "angular2/http";
import {RouterLink} from "angular2/router";
import {CORE_DIRECTIVES} from "angular2/common";
import {FORM_DIRECTIVES} from "angular2/common";
import {View} from "angular2/core";
import {usernameKey} from "../common/consts";



@Component({
    selector: 'login',
    templateUrl: './app/login/login.html',
    directives: [RouterLink, CORE_DIRECTIVES, FORM_DIRECTIVES ]
})

export class Login {

    result: Object;
    error: Object;
    http: Http;
    router: Router;
    public message:string = "";

    constructor(public router: Router, public http: Http) {
        this.router = router;
        this.http = http;
    }

    login(event, username, password) {
        this.message = "";

        event.preventDefault();
        console.log("login");
        let body = JSON.stringify({ username, password });


        this.http.post('api/login', body, { headers: contentHeaders })
            .map(response =>  {
                //var authHeaderString = response.json().authHeader;
                //console.log(authHeaderString);
                localStorage.setItem("id", response.json().user._id);
                localStorage.setItem(autKey, response.json().authHeader);
                localStorage.setItem(usernameKey, response.json().user.username)
                this.router.parent.navigateByUrl('/');
            })
            .subscribe(
                response => {
                    console.log(response);
                },
                error => {
                    this.message = error.json().message;
                    //this.error = error
                }
            );
    }
}

