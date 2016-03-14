import {Injectable} from 'angular2/core';
import {Headers} from "angular2/http";

import {Http} from "angular2/http";
import {Response} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {User} from "../services/profile.service";


@Injectable()
export class FriendsService {

    constructor(private _http: Http) {}

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
                (res:Response) => res.json(),
                error => {error}
            );
    }

    confirmFriendship(friendshipId:String):any {
        console.log(friendshipId);
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



export class Friendship{
    _id:string
    isActive:string
    friends:Friend[];
    userid:string;
    user:User;
}

export class Friend{
    id:string;
}

export class SearchResult{
    data: User[];
    items:any;
    pages:any;
}