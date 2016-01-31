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
    providers: [ChatService]
})

export class Chat {

    auth = localStorage.getItem('AuthKey');
    username = localStorage.getItem('username')
    userDict = {};

    conversations = new Conversations();

    constructor(private _chatService:ChatService) {
        this.username = localStorage.getItem('username');

    }


    ngOnInit() {
        var basicAuth = localStorage.getItem('AuthKey');
        if (basicAuth) {
            this.loadConversations();
          //  this.newConversation("goethe");
        }
    }

    newConversation(username:string){
        if (this.username) {
            if(username){
                this._chatService.newConversation(username)
                    .subscribe(){
                    (res) => {
                        console.log(res)
                    }
                }
            }
        }

    }

    loadConversations() {
        if (this.username) {
            this._chatService.loadConversations()
                .subscribe(
                    (res) => {

                        //this.conversations.conversations = res.conversations;

                        res.conversations.forEach(conversation=> {
                            console.log(conversation)
                            this.conversations.conversations.push(conversation);
                        }


                        //this.conversations.forEach(conversation => {
                        //    conversation.authors.forEach(user => {
                        //        this.userDict[user._id] = "";
                        //    });
                        //})

                        for(var key in this.userDict) {
                            console.log(this.userDict[key]);
                        }

                        console.log(this.userDict);

                    },
                    error => {
                        console.log(error.message);
                    }
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
