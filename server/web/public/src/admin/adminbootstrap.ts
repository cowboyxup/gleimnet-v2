
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
import {AuthHttp, AuthConfig} from "../common/angular2-jwt";
import {AuthService} from "./services/auth.service";
import {AdminService} from "./services/admin.service";


/*
 * Bootstrap our Angular app with a top level component `App` and inject
 * our Services and Providers into Angular's dependency injection
 */
export function main() {
    return bootstrap(App, [
        // These are dependencies of our App
        HTTP_PROVIDERS,
        ROUTER_PROVIDERS,
        AuthService,
        AdminService,
        provide(AuthHttp, {
            useFactory: (http) => {
                return new AuthHttp(
                    new AuthConfig(
                        {
                            noJwtError: true
                        }
                    ), http
                );
            },
            deps: [Http]
        }),
        provide(
            LocationStrategy,
            {useClass: HashLocationStrategy}
        )
    ])
        .catch(err => console.error(err));
}

document.addEventListener('DOMContentLoaded', main);
