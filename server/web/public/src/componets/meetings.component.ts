import {Component} from "angular2/core";
import {Router} from "angular2/router";
import {AuthService} from "../services/auth.service";
import {ProtectedDirective} from "../directives/protected.directive";

@Component({
    selector: 'meetings',
    directives: [
        ProtectedDirective
    ],
    template: `
        <div protected> 
            <div class="row">
                <div class="col s12">
                    <div class="card">
                        <div class="card-content">
                            <span class="card-title activator grey-text text-darken-4">
                                Treffen
                            </span>
                            <!--<h2>{{message}}</h2>-->
                        </div>
                    </div>
                </div>
             </div>
        </div>
        `
})

export class MeetingsComponent {

    constructor(private _authService: AuthService,
                private _router: Router) {
    }

}
