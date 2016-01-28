import {Directive, Attribute, ElementRef, DynamicComponentLoader} from 'angular2/core';
import {Router, RouterOutlet, ComponentInstruction} from 'angular2/router';
import {Login} from '../login/login';

@Directive({
    selector: 'router-outlet'
})
export class LoggedInRouterOutlet extends RouterOutlet {
    publicRoutes: any;
    public parentRouter: Router;

    constructor(_elementRef: ElementRef, _loader: DynamicComponentLoader,
                _parentRouter: Router, @Attribute('name') nameAttr: string) {
        super(_elementRef, _loader, _parentRouter, nameAttr);

        this.parentRouter = _parentRouter;
        this.publicRoutes = {
            '/login': true,
            '/home': true
        };
    }

    activate(instruction: ComponentInstruction) {
        var url = this.parentRouter.lastNavigationAttempt;
        if (!this.publicRoutes[url] && !localStorage.getItem('AuthKey')) {
            // todo: redirect to Login, may be there a better way?
            this.parentRouter.navigateByUrl('/login');
        }
        return super.activate(instruction);
    }
}
