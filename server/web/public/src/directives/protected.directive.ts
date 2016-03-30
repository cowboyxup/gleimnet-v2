import {Directive, OnDestroy} from 'angular2/core';
import {AuthService} from '../services/auth.service';
import {Router, Location} from "angular2/router";

@Directive({
    selector: '[protected]'
})

export class ProtectedDirective {
    private sub: any = null;

    constructor(private authService: AuthService,
                private router: Router,
                private location: Location) {

        if (!authService.isAuthenticated()) {
            this.location.replaceState('/');
            this.router.navigate(['Login']);
        }

        this.authService.authenticated$
            .subscribe((isAuthenticated: boolean) => {
                    if (!isAuthenticated) {
                        //this.location.replaceState('/');
                        this.router.navigate(['Login']);
                    }
                });
    }
}
