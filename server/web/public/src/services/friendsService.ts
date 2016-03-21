import {Injectable} from 'angular2/core';

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import {headers} from "./common";
import {Response} from "angular2/http";
import {Paged, User} from "../models";


@Injectable()
export class FriendsService {

    baseUrl:string = "api/v1/friends";
    searchedFriends:Subject<Array<User>> = new Subject<Array<User>>();


    constructor(private _http: AuthHttp) {}


    findNewFriend(name:string) {
        if(name!="") {
            this._http.get(this.baseUrl + "?search=" + name, {headers: headers()})
                .map((res:Response) => res.json())
                .subscribe(
                    (res:Paged<User>) => {
                        console.log(res);
                        this.searchedFriends.next(res.data);
                    }
                );
        }
    }

    requestFriendship(userId:string) {

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