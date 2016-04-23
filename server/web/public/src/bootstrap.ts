
/*
* Providers provided by Angular
*/
import {bootstrap} from 'angular2/platform/browser';
import {provide} from 'angular2/core';
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {HTTP_PROVIDERS, Http} from 'angular2/http';

/*
* App Component
* our top level component that holds all of our components
*/
import {App} from './app';
import {AuthService} from "./services/auth.service";
import {AuthHttp, AuthConfig} from "./common/angular2-jwt";
import {FriendsService} from "./services/friends.service";
import {TimelineService} from "./services/timeline.service";
import {ProfileService} from "./services/profile.service";
import {ChatService} from "./services/chat.service";

/*
* Bootstrap our Angular app with a top level component `App` and inject
* our Services and Providers into Angular's dependency injection
*/
export function main() {
    return bootstrap(App, [
        // These are dependencies of our App
        HTTP_PROVIDERS,
        ROUTER_PROVIDERS,
        provide(AuthHttp, {
            useFactory: (http) => {
                return new AuthHttp(new AuthConfig(), http);
            },
            deps: [Http]
        }),
        AuthService,
        FriendsService,
        TimelineService,
        ProfileService,
        ChatService,
        provide(
            LocationStrategy,
            {useClass: HashLocationStrategy}
)
])
.catch(err => console.error(err));
}

document.addEventListener('DOMContentLoaded', main);
