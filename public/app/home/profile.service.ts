import {Injectable} from 'angular2/core';
import {Headers} from "angular2/http";

import {Http} from "angular2/http";
import {Headers} from "angular2/http";
import {Response} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {error} from "util";

@Injectable()
export class ProfileService {

    http: Http;

    constructor(public http: Http) {
        this.http = http;
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

        return this.http.get(url, {headers})
            .map((res:Response) => res.json());
    }


    loadTimeline(username:string){

        var url = 'api/timeline/' + username;
        var headers = this.headers();

        return this.http.get(url, {headers})
            .map((res:Response) => res.json());
    }

    postNewPosting(username:string, content:string){

        var url = 'api/timeline/' + username;
        let body = JSON.stringify({content });

        return this.http.post(url, body, { headers: this.headers() })
            .map(response =>  { });

    }

    commentOnPosting(content:string, postId:string){

        var url = 'api/timeline/message/' + postId;
        let body = JSON.stringify({content });

        return this.http.post('api/timeline/message/' + postId, body, { headers: this.headers() })
            .map(response =>  {
            });
    }
}

export class User{
    firstName:string;
    lastName:string;
    birthday:string;
    information:string;
    friends:Friend[];
}

export interface Friend{
    _id: string;
    lastName:string;
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