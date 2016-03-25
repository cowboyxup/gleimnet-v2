import {Injectable} from 'angular2/core';
import {Response} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {headers} from "./common";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import {Paged, Thread, Post, indexOfId} from "../models";
import {BehaviorSubject, AsyncSubject} from "rxjs/Rx";
import {Observer} from "rxjs/Observer";
import {AuthService} from "./auth.service";


@Injectable()
export class ChatService {

    baseUrl = '/api/v1/conversations';

    currentThread: Subject<Thread> =
        new BehaviorSubject<Thread>(new Thread());

    threadsSubject: Subject<Array<Thread>> =
        new AsyncSubject<Array<Thread>>();

    private _threads:Array<Thread> = new Array<Thread>();
    threads$: Observable<Thread[]>;
    private _threadsObserver: Observer<Thread[]>;

    constructor(public _http: AuthHttp) {
        
        this.threads$ = new Observable(observer =>
            this._threadsObserver = observer).share();
    }

    setThreads(conversations:Array<Conversation>){

        conversations.forEach(conversation => {

            let index:number = indexOfId(this._threads, conversation._id)

            if (index == -1) {
                var thread = new Thread();

                thread._id = conversation._id;

                conversation.authors.forEach((conversationUser:ConversationUser) =>{
                    thread.authorIds.push(conversationUser._id);
                });

                        
                this._threads.push(thread);
                this._threadsObserver.next(this._threads);

            } else {

                var oldThread:Thread = this._threads[index];

                if(oldThread.timeUpdated != conversation.timeUpdated){
                    oldThread.timeUpdated = conversation.timeUpdated
                    this.loadMessagesForThred(oldThread._id);
                    this.threadsSubject.next(this._threads) ;
                }
            }
        });
    }

    setCurrentThread(newThread: Thread): void {
        this.currentThread.next(newThread);
    }

    loadMessagesForThred(conversationId){

    }

    loadConversations() {

        return this._http.get(this.baseUrl, { headers: headers() })
            .map((responseData) => {
                return responseData.json();
            }).subscribe(( converstions:Paged<Conversation>)=>{
                //console.log(converstions.data[0]._id);
                //this.loadConversation(converstions.data[0]._id);
                this.setThreads(converstions.data);
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
        console.log("sendMessage: " + content + " conversationId: " + conversationId);
        let body = JSON.stringify({content });

        return this._http.post(this.baseUrl + "/" + conversationId, body ,{ headers: headers() })
            .map((responseData) => {
                return responseData.json();
            }).subscribe((converstions:Paged<Conversation>)=>{
                console.log(converstions);
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
    _id:string;
}