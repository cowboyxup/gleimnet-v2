import {Component} from 'angular2/core';

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {ChatService} from "./chat.service";
import {Conversation} from "./chat.service";
import {Message} from "./chat.service";
import {ConversationUser} from "./chat.service";
import {User} from "../home/profile.service";
import {Conversations} from "./chat.service";


@Component({
    selector: 'Chat',
    templateUrl: './app/chat/chat.html',
    providers:[ChatService]
})

export class Chat {

    auth =  localStorage.getItem('AuthKey');
    username = localStorage.getItem('username')
    userDict = {};

    conversations:Conversation[];

    constructor(private _chatService:ChatService) {
        this.username = localStorage.getItem('username');

    }


    ngOnInit() {
        var basicAuth =  localStorage.getItem('AuthKey');
        if(basicAuth){
            this.loadConversations();
        }
    }

    loadConversations(){
        if(this.username){
            this._chatService.loadConversations()
                .subscribe(
                    (res:Conversations) => {

                        //console.log(res);


                        res.forEach(conversation=> {
                            console.log(conversation)
                            this.conversations.push(conversation);
                        }

                        this.conversations.forEach(conversation => {
                            conversation.authors.forEach(user => {
                                this.userDict[user._id] = new User();
                            })
                        }
                        console.log(this.userDict);

                    },
                    error => { console.log(error.message);}
                );
        }
    }


}

//var CONVERSATIONS: Conversation[] = [
//    {
//        "_id":"string",
//        "users":[
//            {
//                "username":"Schiller"
//            },
//            {
//                "username":"Goethe"
//            }
//        ],
//        "messages":[
//            {
//                "author":{
//                    "username":"Schiller"
//                },
//                "time":"jetzt",
//                "content":"Hallo"
//            },
//            {
//                "author":{
//                    "username":"Goethe"
//                },
//                "time":"jetzt",
//                "content":"Hallo du"
//            },
//            {
//                "author":{
//                    "username":"Schiller"
//                },
//                "time":"jetzt",
//                "content":"Hallo"
//            },
//            {
//                "author":{
//                    "username":"Goethe"
//                },
//                "time":"jetzt",
//                "content":"Hallo du"
//            }
//        ]
//    },
//    {
//        "_id":"string",
//        "users":[
//            {
//                "username":"Schiller"
//            },
//            {
//                "username":"Goethe"
//            }
//        ],
//        "messages":[
//            {
//                "author":{
//                    "username":"Schiller"
//                },
//                "time":"jetzt",
//                "content":"Hallo"
//            },
//            {
//                "author":{
//                    "username":"Goethe"
//                },
//                "time":"jetzt",
//                "content":"Hallo du"
//            },
//            {
//                "author":{
//                    "username":"Schiller"
//                },
//                "time":"jetzt",
//                "content":"Hallo"
//            },
//            {
//                "author":{
//                    "username":"Goethe"
//                },
//                "time":"jetzt",
//                "content":"Hallo du"
//            }
//        ]
//    },
//    {
//        "_id":"string",
//        "users":[
//            {
//                "username":"Schiller"
//            },
//            {
//                "username":"Goethe"
//            }
//        ],
//        "messages":[
//            {
//                "author":{
//                    "username":"Schiller"
//                },
//                "time":"jetzt",
//                "content":"Hallo"
//            },
//            {
//                "author":{
//                    "username":"Goethe"
//                },
//                "time":"jetzt",
//                "content":"Hallo du"
//            },
//            {
//                "author":{
//                    "username":"Schiller"
//                },
//                "time":"jetzt",
//                "content":"Hallo"
//            },
//            {
//                "author":{
//                    "username":"Goethe"
//                },
//                "time":"jetzt",
//                "content":"Hallo du"
//            }
//        ]
//    }
//];
