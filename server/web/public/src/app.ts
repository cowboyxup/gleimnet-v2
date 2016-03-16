import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/forkJoin';

import 'zone.js';
import 'reflect-metadata';

import {enableProdMode} from "angular2/core";
import {Component, View, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {ROUTER_DIRECTIVES,
    RouteConfig,
    Location,
    ROUTER_PROVIDERS,
    LocationStrategy,
    HashLocationStrategy,
    Route,
    AsyncRoute,
    Router} from 'angular2/router';
import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {AuthHttp} from 'angular2-jwt/angular2-jwt';

import {Chat} from './componets/chat/chat.component';
import {Login} from './componets/login/login.component'
import {Friends} from "./componets/friends/friends";
import {Stream} from "./componets/stream/stream.component";
import {Profile} from "./componets/profile/profile";
import {AuthConfig} from "angular2-jwt/angular2-jwt";
import {AuthService} from "./services/auth.service";
import {CORE_DIRECTIVES} from "angular2/common";

declare var System:any;

@Component({
    selector: 'my-app',
    directives:[ROUTER_DIRECTIVES, CORE_DIRECTIVES],
    template: `
<div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
    <header class="mdl-layout__header">
        <div class="mdl-layout__header-row">
            <!-- Title -->
            <span class="mdl-layout-title">Gleim.net</span>
            <!-- Add spacer, to align navigation to the right -->
            <div class="mdl-layout-spacer"></div>
            <!-- Navigation. We hide it in small screens. -->
            <nav class="mdl-navigation mdl-layout--large-screen-only">
                <a class="mdl-navigation__link" [routerLink]="['/Stream']" >Steam</a>
                <a class="mdl-navigation__link" [routerLink]="['/MyProfile']" >Me</a>
                <a class="mdl-navigation__link" [routerLink]="['/Chat']" >Nachrichten</a>
                <a class="mdl-navigation__link" [routerLink]="['/Friends']">Freunde</a>
                <a class="mdl-navigation__link" *ngIf="!authenticated" (click)="goToLogin()"   href="#">Login</a>
                <a class="mdl-navigation__link" *ngIf="authenticated"  (click)="doLogout()"    href="#">Logout</a>
            </nav>
        </div>
    </header>

    <main class="mdl-layout__content">
        <router-outlet ></router-outlet>
    </main>
</div>
        `
})

@RouteConfig([
    {
        path: '/',
        component: Stream,
        name: 'Stream'
    },
    {
        path: '/profile',
        component: Profile,
        name: 'MyProfile'
    },
    {
        path: '/profile/:id',
        component: Profile,
        name: 'Profile'},
    {
        path: '/chat',
        component: Chat,
        name: 'Chat'},
    {
        path: '/friends',
        component: Friends,
        name: 'Friends'},
    {
        path: '/login',
        component: Login,
        name: 'Login'
    }
])

export class MyApp {

    logedIn:boolean =false;
    logInOut: string = "Login";
    private sub:any = null;


    constructor(private _router: Router,
                public _authService:AuthService) {
        //enableProdMode();
    }

    ngOnInit(): void {
        this._authService.authenticated$
            .subscribe((isAuthenticated: boolean) => {
                this.logedIn=isAuthenticated;
                console.log('isAuthenticated: ' + this.authenticated);

            }
        )
    }

    get authenticated() {
        return this._authService.isAuthenticated();
    }

    goToLogin() {
        this._router.navigateByUrl('/login');
    }

    doLogout() {
        this._authService.doLogout();
    }
}

bootstrap(MyApp,
    [
        ROUTER_PROVIDERS,
        HTTP_PROVIDERS,
        AuthService,
        provide(
            LocationStrategy,
            {useClass: HashLocationStrategy}
        )
    ]
);
