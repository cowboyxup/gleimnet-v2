import {Injectable} from 'angular2/core';
import {Headers} from "angular2/http";
import {Response} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {Http} from "angular2/http";
import {headers} from "./common";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import {Paged} from "../models";


@Injectable()
export class ChatService {

    baseUrl = '/api/v1/conversations';
    constructor(public _http: AuthHttp) {
    }

    loadMessage(id:string){
        var url = 'api/conversations/messages/' + id;

        return this._http.get(url, { headers: headers() })
            .map((responseData) => {
                return responseData.json();
            });
    }

    loadConversations() {

        return this._http.get(this.baseUrl, { headers: headers() })
            .map((responseData) => {
                return responseData.json();
            }).subscribe(( converstions:Paged<Conversation>)=>{
                console.log(converstions.data[0]._id);
                this.loadConversation(converstions.data[1]._id);
            });
    }

    loadConversation(id:string) {

        return this._http.get(this.baseUrl + "/" + id, { headers: headers() })
            .map((responseData) => {
                return responseData.json();
            }).subscribe(res=>{
                console.log(res);
            });
    }

    newConversation(_id:string):any{
        let body = JSON.stringify({_id });

        return this._http.post(this.baseUrl, body, { headers: headers() })
            .map((responseData) =>  {
                console.log(responseData);
                return responseData.json();
            });
    }

    sendNewMessage(content:string, conversationId:string):any{

        let body = JSON.stringify({content });

        return this._http.post(this.baseUrl + "/" + conversationId, body ,{ headers: headers() })
            .map((responseData) => {
                return responseData.json();
            });
    }


}



export class Conversation{
    _id:string;
    timeCreated:string;
    timeUpdated:string;
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