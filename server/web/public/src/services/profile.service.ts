import {Injectable} from 'angular2/core';
import {Response} from "angular2/http";

import 'rxjs/Observable';
import {headers} from "./common";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import { AsyncSubject} from "rxjs/Rx";
import {Subject} from "rxjs/Subject";
import {User, indexOfId} from "../models";



@Injectable()
export class ProfileService {
    baseUrl = 'api/v1/profile/'

    private _userArray:Array<User> = new Array<User>();

    constructor(public _http: AuthHttp) {}


    getUserForId(id:string):Subject<User> {

        var currentUser:Subject<User> = new AsyncSubject<User>();

        let index = indexOfId(this._userArray, id);

        if (index != -1) {
            // console.log("User ist enthalten");

            let user: User = this._userArray[index];

            currentUser.next(user);
            currentUser.complete();
        } else {
            // console.log("User ist nicht enthalten");

            let http = this._http;
            let baseUrl = this.baseUrl;

            http.get(baseUrl + id, {headers: headers()})
                .map((res:Response) => {
                    return res.json();
                })
                .subscribe(
                    (res:User) => {
                        //console.log(res);
                        this._userArray.push(res);
                        currentUser.next(res);
                        currentUser.complete();
                    },
                    error => {
                        console.log(error);
                        currentUser.complete();
                    }
                );
        }

        return currentUser;
    }

    loadTimeline(username:string){

        var url = 'api/timeline/' + username;

        return this._http.get(url, { headers: headers() })
            .map((res:Response) => res.json());
    }

    postNewPosting(username:string, content:string){

        var url = 'api/timeline/' + username;
        let body = JSON.stringify({content });

        return this._http.post(url, body, { headers: headers() })
            .map(response =>  { });
    }

    commentOnPosting(content:string, postId:string){

        var url = 'api/timeline/message/' + postId;
        let body = JSON.stringify({content });

        return this._http.post(url, body, { headers: headers() })
            .map(response =>  {
            });
    }
}


export interface Timeline{
    _id:string;
    messages:Messages[];
}

export interface Messages{
    _id:string;
    author:string;
    content:string;
    comments:Comment[];
}

export interface Comment{
    _id:string;
    author:string;
    content:string;
}