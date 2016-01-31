import {Injectable} from 'angular2/core';
import {Headers} from "angular2/http";

import {Http} from "angular2/http";
import {Response} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';

@Injectable()
export class ProfileService {


    constructor(public _http: Http) {
    }

    headers(){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var basicAuth =  localStorage.getItem('AuthKey');
        headers.append('Authorization',basicAuth);

        return headers;
    }

    loadProfilInfos(username:string){

        var url = 'api/users/username/' + username;
        var headers = this.headers();

        return this._http.get(url, {headers})
            .map((res:Response) => res.json());
    }

    loadProfilInfosWithID(id:string){

        var url = 'api/users/' + id;
        var headers = this.headers();

        return this._http.get(url, {headers})
            .map((res:Response) => res.json());
    }

    loadTimeline(username:string){

        var url = 'api/timeline/' + username;
        var headers = this.headers();

        return this._http.get(url, {headers})
            .map((res:Response) => res.json());
    }

    postNewPosting(username:string, content:string){

        var url = 'api/timeline/' + username;
        let body = JSON.stringify({content });

        return this._http.post(url, body, { headers: this.headers() })
            .map(response =>  { });
    }

    commentOnPosting(content:string, postId:string){

        var url = 'api/timeline/message/' + postId;
        let body = JSON.stringify({content });

        return this._http.post(url, body, { headers: this.headers() })
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
    _id:string;
    avatar:string;
    description:string;
    givenName:string;
    nickname:string;
    surename:string;
    timeCreated:string;
    timeline:string;
    titlePicture:string;
    username:string;
    firstName:string;
    lastName:string;
    birthdate:string;
    information:string;
    friends:ProfileFriend[];

    dateString:string;
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