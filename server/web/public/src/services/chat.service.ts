import {Injectable, OnInit} from 'angular2/core';

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {headers} from "./common";
import {Paged, Thread, Post, indexOfId, Message, IdInterface} from "../models";
import {BehaviorSubject, AsyncSubject} from "rxjs/Rx";
import {Observer} from "rxjs/Observer";
import {AuthHttp} from "../common/angular2-jwt";


    @Injectable()
    export class ChatService {

        currentThread: Subject<Thread> = new BehaviorSubject<Thread>(new Thread());
        threadsSubject: Subject<Array<Thread>> = new AsyncSubject<Array<Thread>>();

        threads$: Observable<Thread[]>;

        currentThreadMessagesSubject: Subject<Message> = new Subject<Message>();
        currentThreadMessages: Array<Message> = [];

        currentUnreadCoutSubject: Subject<number> = new Subject<number>();
        currentUnreadCout: number = 0;


        private baseUrl = '/api/v1/conversations';
        private _threads: Array<Thread> = [];
        private _threadsObserver: Observer<Thread[]>;

        private intervalConversations;
        private intervalSingleThread;

        constructor(public _http: AuthHttp) {
            this.threads$ = new Observable(observer => {
                this._threadsObserver = observer;
            }).share();

            this.currentThread.subscribe((thread: Thread) => {
                if ( thread !== null ) {
                    this.loadConversation(thread._id);
                    this.currentThreadMessages = [];
                }
            });

        }


        setThreads(conversations: Array<Conversation>) {
            this.currentUnreadCout = 0;

            conversations.forEach(conversation => {

                let index: number = indexOfId(this._threads, conversation._id);

                if ( index === -1 ) {
                    var thread = new Thread();

                    thread._id = conversation._id;

                    conversation.authors.forEach((conversationUser: ConversationUser) => {
                        thread.authorIds.push(conversationUser._id);
                    });

                    thread.timeUpdated = conversation.timeUpdated;

                    this._threads.push(thread);

                } else {
                    var oldThread: Thread = this._threads[index];

                    if ( oldThread.timeUpdated !== conversation.timeUpdated ) {
                        oldThread.timeUpdated = conversation.timeUpdated;
                        this.loadConversation(oldThread._id);
                        this.threadsSubject.next(this._threads);
                    }
                }

                var userId =   localStorage.getItem('userId');
                console.log(userId);


                    let messageIndex: number = indexOfId(conversation.unread, userId);

                    if ( messageIndex !== -1 ) {
                        this.currentUnreadCout++;
                    }


            });

            this.currentUnreadCoutSubject.next(this.currentUnreadCout);
            this._threadsObserver.next(this._threads);
        }

        setCurrentThread(newThread: Thread): void {
            this.currentThread.next(newThread);
            this.markConversationAsRead(newThread._id);
        }

        loadConversations() {
            this._http.get(this.baseUrl, {headers: headers()})
                .map((responseData) => {
                    return responseData.json();
                }).subscribe((converstions: Paged<Conversation>) => {
                //console.log(converstions.data[0]._id);
                //this.loadConversation(converstions.data[0]._id);
                this.setThreads(converstions.data);
            });
        }

        loadConversation(id: string) {
            if ( id != null ) {
                this._http.get(this.baseUrl + "/" + id, {headers: headers()})
                    .map((responseData) => {
                        return responseData.json();
                    }).subscribe((res: PagedMessages) => {
                    //console.log(res.messages);

                    this.setMessages(res.messages);
                });
            }
        }

        newConversation(_id: string): any {
            let body = JSON.stringify({_id});

            return this._http.post(this.baseUrl, body, {headers: headers()})
                .map((responseData) => {
                    console.log(responseData);
                    return responseData.json();
                });
        }

        markConversationAsRead(conversationId: string): any {

                console.log("markConversationAsRead: " + conversationId);

            let read = true;
            let body = JSON.stringify({read});


            return this._http.post(this.baseUrl + "/" + conversationId + "/read", body, {headers: headers()})
                    .map((responseData) => {
                        return responseData.json();
                    }).subscribe(res => {
                        this.loadConversations();
                    });

        }

        sendNewMessage(content: string, conversationId: string): any {
            if ( conversationId !== "" && content !== "" ) {

                console.log("sendMessage: " + content + " conversationId: " + conversationId);
                let body = JSON.stringify({content});

                return this._http.post(this.baseUrl + "/" + conversationId, body, {headers: headers()})
                    .map((responseData) => {
                        return responseData.json();
                    }).subscribe((converstions: Paged<Conversation>) => {
                        this.loadConversations();
                        console.log(converstions);
                    });
            }
        }



        private setMessages(messages: Array<Message>) {
            messages.forEach((message: Message) => {
                var index: number = indexOfId(this.currentThreadMessages, message._id);

                if ( index === -1 ) {
                    this.currentThreadMessages.push(message);
                    this.currentThreadMessagesSubject.next(message);
                }
            });
        }
    }

export class Conversation {
    _id: string;
    timeCreated: string;
    timeUpdated: string;
    authors: ConversationUser[];
    unread: IdInterface[];
}

export class ConversationUser {
    _id: string;
}

export class PagedMessages {
    _id: string;
    items: {
        begin: number;
        end: number;
        limit: number;
        total: number;
    };
    pages: {
        current: number;
        hasNext: boolean
        hasPrev: boolean;
        next: number
        prev: number;
        total: number;
    };
    messages: Message[];
    timeCreated: Date;
    unread: IdInterface[];
}
