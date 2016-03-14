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
    template: `
        <div class="mdl-cell mdl-cell--4-col centeredLogin">
            <div class="demo-card-square mdl-card mdl-shadow--2dp">
                <div class="mdl-card__title mdl-card--expand">
                    <h3>Login</h3>
                    <!--<h2>{{message}}</h2>-->
                </div>
                <div class="mdl-card__supporting-text">

                    <form>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input #username type="text" class="mdl-textfield__input" placeholder="Benutzername">
                            <!--<label for="comment" class="mdl-textfield__label">-->
                               <!--Benutzername-->
                            <!--</label>-->
                        </div>

                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input #password type="text" class="mdl-textfield__input" placeholder="Password">
                             <!--<label for="comment" class="mdl-textfield__label">-->
                               <!--Password-->
                            <!--</label>-->
                        </div>

                        <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
                            (click)="login(username.value, password.value );">
                            Anmelden
                        </button>
                    </form>
                </div>
            </div>
        </div>
        `,
    directives: [RouterLink, CORE_DIRECTIVES, FORM_DIRECTIVES]
})

export class Login {

    result:Object;
    error:Object;
    public message:string = "";

    constructor(private _router:Router, private _http:Http) {}

    login(username, password) {
        this.message = "";

        event.preventDefault();
        console.log("login");
        let body = JSON.stringify({username, password});


        this._http.post('api/v1/auth', body, {headers: contentHeaders})
            .map(
                (res:Response) =>{
                   return res.json()
                }
            )
            .subscribe(res =>{
                    console.log(res);
                },
                error => {
                    this.message = error.message;
                }
            );


            //    //var authHeaderString = response.json().authHeader;
            //    //console.log(authHeaderString);
            //    response.json();
            //    //localStorage.setItem("id", response.json().user._id);
            //    //localStorage.setItem(autKey, response.json().authHeader);
            //    //localStorage.setItem(usernameKey, response.json().user.username)
            //    //this._router.parent.navigateByUrl('/');
            //})
            //.subscribe(
            //    response => {
            //        console.log(response);
            //    },
            //    error => {
            //        this.message = error.message;
            //        //this.error = error
            //    }
            //);
    }
}
