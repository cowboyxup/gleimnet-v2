

import {contentHeaders } from '../../common/headers';
import {autKey, authHeader } from '../../common/consts';

import {usernameKey} from "../../common/consts";
import {AuthService} from "../../services/auth.service";
import {Component} from "angular2/core";
import {Router} from "angular2/router";
import {Http} from "angular2/http";
import {FORM_DIRECTIVES} from "angular2/common";
import {CORE_DIRECTIVES} from "angular2/common";
import {RouterLink} from "angular2/router";

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
    providers: [AuthService],
    directives: [RouterLink, CORE_DIRECTIVES, FORM_DIRECTIVES]
})

export class Login {

    result:Object;
    error:Object;
    public message:string = "";

    constructor(private _router:Router,
                private _http:Http,
                private _authService:AuthService ) {}

    login(username, password) {
        this.message = "";

        this._authService.doLogin(username,password);

    }
}
