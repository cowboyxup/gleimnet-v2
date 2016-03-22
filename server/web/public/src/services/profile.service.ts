import {Injectable} from 'angular2/core';
import {Response} from "angular2/http";

import 'rxjs/Observable';
import {headers} from "./common";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {BehaviorSubject} from "rxjs/Rx";
import {Subject} from "rxjs/Subject";
import {User} from "../models";
import {contains, indexOf} from "../common/arrays";



@Injectable()
export class ProfileService {
    baseUrl = 'api/v1/profile/'


    private _user:User;
    public user$: Observable<User>;
    private _userObserver: Observer<User>;


    private _userArray:Array<User> = new Array<User>();

    constructor(public _http: AuthHttp) {

        this.user$ = new Observable(observer =>
            this._userObserver = observer).share();
    }

    private setUser(user:User){
        this._user = user;
        this._userObserver.next(this._user);
    }



    getUserForId(id:string):Subject<User>{

        var currentUser: Subject<User> = new BehaviorSubject<User>(null);

        //console.log(id);

        var user = new User("");
        user._id = id;

        let index:number = indexOf(this._userArray, user, (u:User, user) => {
            return u._id == user._id;
        })
        
        if(index == -1){
            currentUser.next(this._userArray[index]);
            currentUser.complete();
        }else{
            let http = this._http;
            let baseUrl = this.baseUrl;

            http.get(baseUrl  + id, { headers: headers() })
                .map((res:Response) => res.json())
                .subscribe(
                    (res:User) => {
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