import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/forkJoin';

import {Component, View, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';

import {HTTP_PROVIDERS} from 'angular2/http';
import {ROUTER_DIRECTIVES,
    RouteConfig,
    Location,
    ROUTER_PROVIDERS,
    LocationStrategy,
    HashLocationStrategy,
    Route,
    AsyncRoute,
    Router} from 'angular2/router';

//import {Page1} from './pages/page1';
//import {Page2} from './pages/page2';
import {Home} from './home/home';
import {Chat} from './chat/chat';
import {Login} from './login/login'
import {LoggedInRouterOutlet} from "./LoggedInRouterOutlet";
import {Profile} from "./home/profile";
import {Friends} from "./friends/friends";
import {NotFound} from "./pages/NotFound";

declare var System:any;

@Component(
    {
        selector: 'my-app',
        templateUrl: './app/app.html',
        directives:[ROUTER_DIRECTIVES, LoggedInRouterOutlet]
    })

@RouteConfig([
    //new Route({path: '/page1', component: Page1, name: 'Page1'}),
    new Route({path: '/', component: Home, name: 'Home'}),
    new Route({path: '/profile/:id', component: Profile, name: 'Profile'}),
    new Route({path: '/chat', component: Chat, name: 'Chat'}),
    new Route({path: '/friends', component: Friends, name: 'Friends'}),
    new Route({path: '/login', component: Login, name: 'Login'}),
    new Route({path: '/404', component: NotFound, name: 'NotFound'}),

])

class MyDemoApp {

    router: Router;
    location: Location;
    logInOut: string = "Login";

    constructor(router: Router, location: Location) {
        this.router = router;
        this.location = location;

        if (!localStorage.getItem('AuthKey')) {
            this.logInOut = "Login";
        }else {
            this.logInOut = "Logout";
        }
    }

    getLinkStyle(path) {

        if(path === this.location.path()){
            return true;
        }
        else if(path.length > 0){
            return this.location.path().indexOf(path) > -1;
        }
    }

    onSelect() {
        if (localStorage.getItem('AuthKey')) {
            localStorage.removeItem('AuthKey');
            localStorage.removeItem('username');
            this.logInOut = "Login"
        }else {
            this.logInOut = "Logout"
        }

        this.router.navigateByUrl('/login');
    }
}

class ComponentHelper{

    static LoadComponentAsync(name,path){
        return System.import(path).then(c => c[name]);
    }
}

bootstrap(MyDemoApp,
    [ROUTER_PROVIDERS,
        HTTP_PROVIDERS,
        provide(
            LocationStrategy,
            {useClass: HashLocationStrategy}
        )
    ]
);
