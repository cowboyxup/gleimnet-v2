import {Injectable, bind} from 'angular2/core';
import {Http, Headers} from 'angular2/http'
import {Router} from "angular2/router";
import {Response} from "angular2/http";

import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/Rx";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";

import {AuthHttp, JwtHelper} from 'angular2-jwt';

import {headers} from "./common";


@Injectable()
export class AuthService {

    private _authenticated:boolean = false;
    public authenticated$: Observable<boolean>;
    private _authenticatedObserver: Observer<boolean>;

    jwtHelper: JwtHelper = new JwtHelper();

    private _token:string;
    private _decodedToken:any;
    private _tokenExpirationDate:Date;
    private _isTokenExpired:boolean;
    private _userId:string;

    constructor(private _http:Http, private _router:Router) {

        this.authenticated$ = new Observable(observer =>
            this._authenticatedObserver = observer).share();


        this._token = localStorage.getItem('id_token');

        if(this._token != null){
           this._decodedToken = this.jwtHelper.decodeToken(this._token)
           this._tokenExpirationDate =  this.jwtHelper.getTokenExpirationDate(this._token)
           this._isTokenExpired = this.jwtHelper.isTokenExpired(this._token)

           this._authenticated = !this._isTokenExpired;

           this._userId = this._decodedToken._id;
           localStorage.setItem('userId', this._userId);
        }
    }

    public doLogin(username:string, password:string) {
        console.log("doLogin: username: " + username + " password: " + password)

        var url = 'api/v1/auth';
        let body = JSON.stringify({username, password });

        this._http.post(url, body, { headers: headers() })
            .map(
                (response:Response) =>  {
                    if(response.status == 200){
                        this._token = response.text();
                        localStorage.setItem('id_token', this._token);

                        this._decodedToken = this.jwtHelper.decodeToken(this._token)
                        this._tokenExpirationDate =  this.jwtHelper.getTokenExpirationDate(this._token)
                        this._isTokenExpired = this.jwtHelper.isTokenExpired(this._token)

                        this._userId = this._decodedToken._id;
                        localStorage.setItem('userId', this._userId);

                        this.authenticated(true);
                    }
                },
                error => {
                    console.log("Error:");
                    console.log(error);
                }
            )
            .subscribe();
    }

    public doLogout() {
        console.log('doLogout');
        localStorage.removeItem('userId');
        localStorage.removeItem('id_token');

        this.authenticated(false);
    }

    private authenticated(is:boolean){
        this._authenticated = is;
        this._authenticatedObserver.next(this._authenticated);
    }

    public getUserId(){
        return this._userId;
    }

    public getSession() {
    }

    isAuthenticated():boolean {
        return this._authenticated;
    }


}
