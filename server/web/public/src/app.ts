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
    Router} from 'angular2/router';
import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {AuthHttp} from 'angular2-jwt/angular2-jwt';

import {Chat} from './componets/chat/chat.component';
import {Login} from './componets/login/login.component'
import {Friends} from "./componets/friends/friends";
import {Stream} from "./componets/stream/stream.component";
import {AuthConfig} from "angular2-jwt/angular2-jwt";
import {AuthService} from "./services/auth.service";
import {CORE_DIRECTIVES} from "angular2/common";
import {ProfileComponent} from "./componets/profile.component";
import {ProfileService} from "./services/profile.service";
import {UnreadMessagesCount} from "./componets/chat/unreadMessagesCount";
import {ChatService} from "./services/chat.service";
import {FriendsService} from "./services/friends.service";
import {TimelineService} from "./services/timeline.service";
import {UserService} from "./services/user.service";
import {MessagesService} from "./services/chat/MessagesService";

declare var System:any;

@Component({
    selector: 'my-app',
    directives:[
        ROUTER_DIRECTIVES,
        CORE_DIRECTIVES,
        UnreadMessagesCount
    ],
    template: `
<div class="navbar-fixed">
    <nav>
        <div class="nav-wrapper">
            <a href="#" class="brand-logo">Gleim.net</a>
            <a href="#" data-activates="mobile-demo" class="button-collapse"><i class="material-icons">menu</i></a>
            
            <ul id="nav-mobile" class="right hide-on-med-and-down">
                <li><a [routerLink]="['/Stream']" >Steam</a></li>
                <li><a [routerLink]="['/MyProfile']" >Me</a></li>
                <li><a [routerLink]="['/Chat']" >
                    Nachrichten <unreadMessagesCount></unreadMessagesCount>
                </a></li>
                <li><a [routerLink]="['/Friends']">Freunde</a></li>
                <li><a *ngIf="!authenticated" (click)="goToLogin()"   href="#">Login</a></li>
                <li><a *ngIf="authenticated"  (click)="doLogout()"    href="#">Logout</a></li>
            </ul>
            
            <ul class="side-nav" id="mobile-demo">
                <li><a [routerLink]="['/Stream']" >Steam</a></li>
                <li><a [routerLink]="['/MyProfile']" >Me</a></li>
                <li><a [routerLink]="['/Chat']" >
                    Nachrichten <unreadMessagesCount></unreadMessagesCount>
                </a></li>
                <li><a [routerLink]="['/Friends']">Freunde</a></li>
                <li><a *ngIf="!authenticated" (click)="goToLogin()"   href="#">Login</a></li>
                <li><a *ngIf="authenticated"  (click)="doLogout()"    href="#">Logout</a></li>
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
        component: Stream,
        name: 'Stream'
    },
    {
        path: '/profile',
        component: ProfileComponent,
        name: 'MyProfile'
    },
    {
        path: '/profile/:id',
        component: ProfileComponent,
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
        ProfileService,
        UserService,
        FriendsService,
        TimelineService,
        ChatService,
        MessagesService,
        provide(
            LocationStrategy,
            {useClass: HashLocationStrategy}
        ),
        provide(AuthHttp, {
            useFactory: (http) => {
                return new AuthHttp(new AuthConfig({
                    headerPrefix: ""
                }), http);
            },
            deps: [Http]
        })
    ]
);
