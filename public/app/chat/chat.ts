import {Component} from 'angular2/core';

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {ChatService} from "./chat.service";
import {Conversation} from "./chat.service";
import {Message} from "./chat.service";
import {ConversationUser} from "./chat.service";


@Component({
    selector: 'Chat',
    templateUrl: './app/chat/chat.html',
    providers:[ChatService]
})

export class Chat {

    conversations:Conversation[]=CONVERSATIONS;

    constructor(private _chatService: ChatService) {

    }

    var CONVERSATIONS: Conversation[] = [
    {
        "_id":"string",
        "users":[
            {
                "username":"Schiller"
            },
            {
                "username":"Goethe"
            }
        ],
        "messages":[
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            },
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            }
        ]
    },
    {
        "_id":"string",
        "users":[
            {
                "username":"Schiller"
            },
            {
                "username":"Goethe"
            }
        ],
        "messages":[
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            },
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            }
        ]
    },
    {
        "_id":"string",
        "users":[
            {
                "username":"Schiller"
            },
            {
                "username":"Goethe"
            }
        ],
        "messages":[
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            },
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            }
        ]
    }
];
}

var CONVERSATIONS: Conversation[] = [
    {
        "_id":"string",
        "users":[
            {
                "username":"Schiller"
            },
            {
                "username":"Goethe"
            }
        ],
        "messages":[
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            },
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            }
        ]
    },
    {
        "_id":"string",
        "users":[
            {
                "username":"Schiller"
            },
            {
                "username":"Goethe"
            }
        ],
        "messages":[
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            },
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            }
        ]
    },
    {
        "_id":"string",
        "users":[
            {
                "username":"Schiller"
            },
            {
                "username":"Goethe"
            }
        ],
        "messages":[
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            },
            {
                "author":{
                    "username":"Schiller"
                },
                "time":"jetzt",
                "content":"Hallo"
            },
            {
                "author":{
                    "username":"Goethe"
                },
                "time":"jetzt",
                "content":"Hallo du"
            }
        ]
    }
];
