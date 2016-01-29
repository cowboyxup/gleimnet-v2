import {Injectable} from 'angular2/core';
import {Headers} from "angular2/http";

import {Http} from "angular2/http";
import {Headers} from "angular2/http";
import {Response} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {error} from "util";

@Injectable()
export class FriendsService {

    constructor(public _http: Http) {
    }

    headers(){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var basicAuth =  localStorage.getItem('AuthKey');
        headers.append('Authorization',basicAuth);

        return headers;
    }


    loadMyFriends(){

        var url = 'api/friends/my';
        var headers = this.headers();

        return this._http.get(url, {headers})
            .map((res:Response) => res.json());
    }
}