import {Component} from "angular2/core";
import {Router} from "angular2/router";
import {Http} from "angular2/http";
import {FORM_DIRECTIVES} from "angular2/common";
import {CORE_DIRECTIVES} from "angular2/common";
import {RouterLink} from "angular2/router";

import {AuthService} from "../../services/auth.service";

@Component({
    selector: 'login',
    directives: [
        RouterLink,
        CORE_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
        <div class="mdl-cell mdl-cell--4-col centeredLogin">
            <div class="demo-card-square mdl-card mdl-shadow--2dp">
                <div class="mdl-card__title mdl-card--expand">
                    <h3>Login</h3>
                    <!--<h2>{{message}}</h2>-->
                </div>

                <div *ngIf="!authenticated" class="mdl-card__supporting-text">

                    <form>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input #username type="text" class="mdl-textfield__input" placeholder="Benutzername" type="text">
                            <!--<label for="comment" class="mdl-textfield__label">-->
                               <!--Benutzername-->
                            <!--</label>-->
                        </div>

                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input #password type="text" class="mdl-textfield__input" placeholder="Password" type="password">
                             <!--<label for="comment" class="mdl-textfield__label">-->
                               <!--Password-->
                            <!--</label>-->
                        </div>

                        <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
                            (click)="login(username.value, password.value );" type="button">
                            Anmelden
                        </button>
                    </form>
                </div>



            </div>
        </div>
        `
})

export class Login {


    constructor(private _authService:AuthService, private _router:Router) {

    }

    ngOnInit(): void {
        this._authService.authenticated$
            .subscribe((isAuthenticated: boolean) => {
                   if(isAuthenticated){
                       setTimeout( () => this._router.navigate(['Stream']) , 1);
                   }
                }
            )
    }

    login(username:string, password:string) {
        this._authService.doLogin(username, password) ;
    }
}
