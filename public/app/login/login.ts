import {Component} from 'angular2/core';

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Http} from "angular2/http";
import {Router} from "angular2/router";

import {contentHeaders } from '../common/headers';
import {autKey, authHeader } from '../common/consts';
import {Response} from "angular2/http";



@Component({
    selector: 'Login',
    templateUrl: './app/login/login.html'
})

export class Login {

    result: Object;
    error: Object;
    http: Http;
    router: Router;

    constructor(public router: Router, public http: Http) {
        this.router = router;
        this.http = http;
    }

    login(event, username, password) {
        event.preventDefault();
        console.log("login");
        let body = JSON.stringify({ username, password });


        this.http.post('api/login', body, { headers: contentHeaders })
            .map((res: Response) => {
                //res.json();
            })
            .subscribe(
                (response:Response) => {
                    localStorage.setItem(autKey, response.json().authHeader);
                    this.router.parent.navigateByUrl('/home');
                }
                ,(error:Error )=> {
                    alert(error.message);
                    console.log(error.message());
                }
            );
    }
}