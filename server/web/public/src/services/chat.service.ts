import {Injectable} from 'angular2/core';
import {Headers} from "angular2/http";
import {Response} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {Http} from "angular2/http";
import {headers} from "./common";


@Injectable()
export class ChatService {

    constructor(public _http: Http) {
    }


    loadMessage(id:string){
        var url = 'api/conversations/messages/' + id;

        return this._http.get(url, { headers: headers() })
            .map((responseData) => {
                return responseData.json();
            });
    }

    loadConversations() {

        var url = 'api/conversations';

        return this._http.get(url, { headers: headers() })
            .map((responseData) => {
                return responseData.json();
            });
    }

    newConversation(username:string):any{

        var url = 'api/conversations';
        let body = JSON.stringify({username });

        return this._http.post(url, body, { headers: headers() })
            .map((responseData) =>  {
                responseData.json()
            });
    }

    sendNewMessage(content:string, conversationId:string):any{

        var url = 'api/conversations/' + conversationId;
        let body = JSON.stringify({content });

        return this._http.post(url, body, { headers: headers() })
            .map((responseData) => {
                return responseData.json();
            });
    }


}

export class ConversationGroup{
    conversations:Conversation[];
    numberOfItems:string;
}

export class Conversation{
    _id:string;
    timeCreated:string;
    messages:ConversationMessage[];
    authors:ConversationUser[];
}

export class Message{
    _id:string;
    author:ConversationUser;
    time:string;
    content:string;
}

export class ConversationMessage{
    id:string;
}

export class ConversationUser{
    id:string;
}