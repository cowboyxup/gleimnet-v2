import {Injectable} from 'angular2/core';
import {Headers} from "angular2/http";

import {Http} from "angular2/http";
import {Response} from "angular2/http";

import 'rxjs/Observable';
import {headers} from "./common";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import Dictionary from "../common/Dictionary";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {BehaviorSubject} from "rxjs/Rx";
import {Subject} from "rxjs/Subject";



@Injectable()
export class ProfileService {
    baseUrl = 'api/v1/profile/'


    private _user:User;
    public user$: Observable<User>;
    private _userObserver: Observer<User>;


    private _userDictionary:Dictionary<string, User>;

    constructor(public _http: AuthHttp) {
        this._userDictionary = new Dictionary<string, User>();

        this.user$ = new Observable(observer =>
            this._userObserver = observer).share();
    }

    private setUser(user:User){
        this._user = user;
        this._userObserver.next(this._user);
    }


    getUserForId(id:string):Subject<User>{

        var currentUser: Subject<User> = new BehaviorSubject<User>(null);


        let http = this._http;
        let baseUrl = this.baseUrl;

            http.get(baseUrl  + id, { headers: headers() })
                .map((res:Response) => res.json())
                .subscribe(
                    (res:User) => {
                        currentUser.next(res);
                        currentUser.complete();
                    },
                    error => {
                        console.log(error);
                        currentUser.complete();
                    }
                );

        return currentUser;
    }

    loadProfilInfosWithID(id:string){

         this._http.get(this.baseUrl + id, { headers: headers() })
            .map((res:Response) => res.json())
            .subscribe(
                (res:User) => {
                    this.setUser(res);
                },
                error => {console.log(error);}
            );
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

    getDateString(dateString:string):string{
        var date = new Date(dateString)
        var options = {
            year: "numeric", month: "short",
            day: "numeric"
        };

        return date.toLocaleDateString('de-de',options);
    }
}

export class User{
    _id:  string;
    avatar:  string;
    birthdate: string;
    birthplace: string;
    description:  string;
    friends: string[];
    givenName: string;
    influenceplace:  string;
    nickname: string;
    tags:  string[];
    timeCreated:  string;
    timeline:  string;
    titlePicture:  string;
}

export interface ProfileFriend{
    _id: string;
    givenName:string;
    username:string;
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