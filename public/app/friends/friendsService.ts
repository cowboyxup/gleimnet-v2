import {Injectable} from 'angular2/core';
import {Headers} from "angular2/http";

import {Http} from "angular2/http";
import {Headers} from "angular2/http";
import {Response} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {error} from "util";
import {User} from "../home/profile.service";

@Injectable()
export class FriendsService {

    constructor(public _http: Http) {
    }

    headers():Headers{
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var basicAuth =  localStorage.getItem('AuthKey');
        headers.append('Authorization',basicAuth);

        return headers;
    }


    requestFriendship(username:string):any{

        var url = 'api/friends';
        var headers = this.headers();
        let body = JSON.stringify({username });

        return this._http.post(url,body, {headers})
            .map(res => {
                    console.log(res);
                }
            );
    }

    loadUnconfirmedFriends():any {
        var url = '/api/friends/my/unconfirmed';
        var headers = this.headers();

        return this._http.get(url, {headers})
            .map(
                (res:Response) => {
                    console.log(res)
                    ;                    res.json()
                }
            );
    }

    confirmFriendship(friendshipId:String):any {
        var url = '/api/friends/' + friendshipId;
        var headers = this.headers();
        let activate = true;
        let body = JSON.stringify({activate });

        return this._http.post(url,body, {headers})
            .map(res => {
                    console.log(res);
                }
            );
    }

    findNewFriend(friendName:String):any {
        var url = '/api/friends?username=' + friendName;
        var headers = this.headers();

        return this._http.get(url, {headers})
            .map(
                (res:Response) => res.json(),
                error => {
                    error
                });
    }
}

export class SearchResult{
    data: User[];
    items:any;
    pages:any;
}