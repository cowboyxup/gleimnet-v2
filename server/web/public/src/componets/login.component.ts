import {Component} from "angular2/core";
import {Router} from "angular2/router";
import {FORM_DIRECTIVES} from "angular2/common";
import {CORE_DIRECTIVES} from "angular2/common";
import {RouterLink} from "angular2/router";

import {AuthService} from "../services/auth.service";

@Component({
    selector: 'login',
    directives: [
        RouterLink,
        CORE_DIRECTIVES,
        FORM_DIRECTIVES,
    ],
    template: `
<div class="row">
    <div class="centeredLogin">
        <div class="card">
            <div class="card-content">
                <span class="card-title activator grey-text text-darken-4">
                    Login
                </span>
                <!--<h2>{{message}}</h2>-->
                
                <form>
                    <div class="row">
                        <div class="input-field col s12">
                            <input #username type="text" class="" type="text" autofocus>
                            <label for="password">Benutzername</label>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="input-field col s12">
                            <input #password type="text" class=""type="password">
                            <label for="password">Password</label>
                        </div>
                    </div>

                     <button class="btn waves-effect waves-light" type="submit" name="action"
                        (click)="login(username.value, password.value );">Anmelden
                        <i class="material-icons right">send</i>
                    </button>

                </form>
                
            </div>

        </div>
    </div>
 </div>
`
})

export class LoginComponent {

    constructor(private _authService: AuthService,
                private _router: Router) {
        this._authService.tryAuth();
    }

    ngOnInit(): void {
        this._authService.authenticated$
            .subscribe((isAuthenticated: boolean) => {
                   if (isAuthenticated) {
                       setTimeout( () => this._router.navigate(['Stream']) , 1);
                   }
            });



    }

    login(username: string, password: string) {
        this._authService.doLogin(username, password) ;
    }
}
