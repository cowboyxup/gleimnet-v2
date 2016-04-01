import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/forkJoin';

import 'zone.js';
import 'reflect-metadata';

import {Component, OnInit} from "angular2/core";
import {CORE_DIRECTIVES} from "angular2/common";
import {
    ROUTER_DIRECTIVES,
    RouteConfig, Router,
} from 'angular2/router';

import {AdminPanelComponent} from  "./components/adminpanel.component";
import {AuthService} from "./services/auth.service";
import {LoginComponent} from "./components/login.comoment";

@Component({
    selector: 'app',
    directives: [
        ROUTER_DIRECTIVES,
        CORE_DIRECTIVES,
        // UnreadMessagesCount
    ],
    template: `
<div class="navbar-fixed">
    <nav>
        <div class="nav-wrapper">
            <a href="#" class="brand-logo">Gleim.net Admin Panel</a>
            
            <ul id="nav-mobile" class="right hide-on-med-and-down">
                <!--<li><a [routerLink]="['/Login']">Login</a></li>-->
                <li><a *ngIf="!authenticated"  (click)="doLogout()"    href="#">Logout</a></li>
            </ul>
        </div>
    </nav>
</div>
<main class="mdl-layout__content">
    <router-outlet ></router-outlet>
</main>
        `
})

@RouteConfig([
    {
        path: '/',
        component: AdminPanelComponent,
        name: 'AdminPanel'
    },
    {
        path: '/login',
        component: LoginComponent,
        name: 'Login'
    }
])


export class App {

    authenticated: boolean = false;

    constructor(private _router: Router,
                public _authService: AuthService) {
        //enableProdMode();
        this._authService.authenticated$
            .subscribe((isAuthenticated: boolean) => {
                this.authenticated = isAuthenticated;
                console.log('isAuthenticated: ' + isAuthenticated);
                // if (isAuthenticated) {
                //
                // }
            });
    }


    doLogout() {
        this._authService.doLogout();
    }

}
