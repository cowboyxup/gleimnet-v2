import {Injectable, EventEmitter} from "angular2/core";
import {Http, Headers} from 'angular2/http'
import {Router} from "angular2/router";
import {Response} from "angular2/http";
import {contentHeaders} from "../common/headers";

@Injectable()
export class AuthService {

    authenticated=true;
    private locationWatcher = new EventEmitter();  // @TODO: switch to RxJS Subject instead of EventEmitter
    private authURL:string = 'api/v1/auth';

    constructor(private _router:Router, private _http:Http) {}



    public doLogin(username, password){

        console.log("login");
        let body = JSON.stringify({username, password});

        this._http.post('api/v1/auth', body, {headers: contentHeaders})
            .map(
                (res:Response) =>{
                    return res.json()
                }
            )
            .subscribe(res =>{
                    console.log(res);
                },
                error => {
                    //this.message = error.message;
                }
            );
    }

    public doLogout() {

    }

    public getUserID() {

    }

    public getUserName() {
    }

    public isAuthenticated() {
        return this.authenticated;
    }

    public subscribe(onNext:(value:any) => void, onThrow?:(exception:any) => void, onReturn?:() => void) {
        return this.locationWatcher.subscribe(onNext, onThrow, onReturn);
    }
}