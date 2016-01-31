import {Injectable} from 'angular2/core';
import {Headers} from "angular2/http";
import {Response} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {error} from "util";
import {Http} from "angular2/http";


@Injectable()
export class ChatService {

    constructor(public _http: Http) {
    }

    headers(){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var basicAuth =  localStorage.getItem('AuthKey');
        headers.append('Authorization',basicAuth);

        return headers;
    }

    public sendMessage(content){

    }



    loadConversations():any {

        var url = 'api/conversations';
        var headers = this.headers();

        return this._http.get(url, {headers})
            .map((res:Response) => res.json());
    }

    newConversation(username:string):any{

        var url = 'api/conversations';
        let body = JSON.stringify({username });

        return this._http.post(url, body, { headers: this.headers() })
            .map(responseData =>  {
                return responseData.json();
            });
    }
}

export class Conversations{
    conversations:Conversation[];
}

export class Conversation{
    _id:string;
    timeCreated:string;
    messages:Message[];
    authors:ConversationUser[];
}

export class Message{
    author:ConversationUser;
    time:string;
    content:string;
}

export class ConversationUser{
    _id:string;
}