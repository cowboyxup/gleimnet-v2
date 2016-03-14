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
import {AccessRouterOutlet} from "./LoggedInRouterOutlet";
import {Friends} from "./componets/friends/friends";
import {Stream} from "./componets/stream/stream.component";
import {Profile} from "./componets/profile/profile";
import {AuthConfig} from "angular2-jwt/angular2-jwt";
import {ProtectedPage} from "./componets/pages/protected-page";
import {AuthService} from "./services/auth.service";

declare var System:any;

@Component({
    selector: 'my-app',
    directives:[ROUTER_DIRECTIVES],
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
                <a class="mdl-navigation__link" (click)="onSelect()">{{logInOut}}</a>
                <a class="mdl-navigation__link" [routerLink]="['/ProtectedPage']">ProtectedPage</a>
            </nav>
        </div>
    </header>
    <!--<div class="mdl-layout__drawer">-->
        <!--<span class="mdl-layout-title">Gleim.net</span>-->
        <!--<nav class="mdl-navigation">-->
           <!--<a class="mdl-navigation__link" [routerLink]="['/Stream']" >Steam</a>-->
           <!--<a class="mdl-navigation__link" [routerLink]="['/MyProfile']" >Me</a>-->
           <!--<a class="mdl-navigation__link" [routerLink]="['/Chat']" >Nachrichten</a>-->
           <!--<a class="mdl-navigation__link" [routerLink]="['/Friends']">Freunde</a>-->
           <!--<a class="mdl-navigation__link" (click)="onSelect()">{{logInOut}}</a>-->
        <!--</nav>-->
    <!--</div>-->

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
        name: 'Login'},
    {
        path: '/public',
        name: 'ProtectedPage',
        component: ProtectedPage
    }
])

export class MyApp {

    logedIn:boolean =false;
    logInOut: string;

    constructor(private _router: Router, private _location: Location) {
        //enableProdMode();

        if (!localStorage.getItem('AuthKey')) {
            this.logInOut = "Login";
        }else {
            this.logInOut = "Logout";
        }
    }


    getLinkStyle(path) {

        if(path === this._location.path()){
            return true;
        }
        else if(path.length > 0){
            return this._location.path().indexOf(path) > -1;
        }
    }

    onSelect() {
        if (localStorage.getItem('AuthKey')) {
            localStorage.removeItem('AuthKey');
            localStorage.removeItem('username');
            localStorage.removeItem("id");

            this.logInOut = "Login"
        }else {
            this.logInOut = "Logout"
        }
        this._router.navigateByUrl('/login');
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
        ),
        provide(AuthHttp, {
        useFactory: (http) => {
            return new AuthHttp(new AuthConfig(), http);
        },
        deps: [Http]
    })
    ]
);
