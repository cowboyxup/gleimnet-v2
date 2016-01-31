import {Component} from 'angular2/core';

import {ChatService} from "./chat.service";
import {Conversation} from "./chat.service";
import {Message} from "./chat.service";
import {ConversationUser} from "./chat.service";
import {User} from "../home/profile.service";
import {ConversationGroup} from "./chat.service";
import {ProfileService} from "../home/profile.service";


@Component({
    selector: 'Chat',
    templateUrl: './app/chat/chat.html',
    providers: [ChatService, ProfileService]
})

export class Chat {

    //auth = localStorage.getItem('AuthKey');
    username = localStorage.getItem('username');

    myConversations:ConversationGroup = new ConversationGroup();

    actConversation:Conversation;

    userDict = {};
    messageDict ={};

    constructor(private _chatService:ChatService,
                private _profileService:ProfileService) {
        this.username = localStorage.getItem('username');
    }

    ngOnInit() {
        var basicAuth = localStorage.getItem('AuthKey');
        if (basicAuth) {
            this.loadConversations();
        }
    }

    newConversation(username:string) {
        if (this.username) {
            if (username) {
                this._chatService.newConversation(username)
                    .subscribe(
                        (res) => {
                            console.log(res)
                        }
                    )
            }
        }
    }

    loadConversations() {
        if (this.username) {
            this._chatService.loadConversations()
                .subscribe(
                    (res:ConversationGroup) => {

                        this.myConversations = res;
                        console.log(this.myConversations);

                        this.myConversations.conversations.forEach(conversation => {
                            conversation.authors.forEach(user => {
                                if(!this.userDict[user.id])
                                    this.userDict[user.id] = new User();
                            })

                            conversation.messages.forEach(message =>{
                                if(!this.messageDict[message.id])
                                    this.messageDict[message.id] = new Message();
                            })
                        })

                        for (var userKey in this.userDict) {
                            if (this.userDict.hasOwnProperty(userKey)) {
                                if(this.userDict[userKey]._id == null){
                                    this._profileService.loadProfilInfosWithID(userKey)
                                        .subscribe(
                                            user => {
                                                this.userDict[user._id] = user;
                                            },
                                            error => {
                                                console.log(error.message);
                                            }
                                        );
                                }
                            }
                        }

                        for (var messageKey in this.messageDict) {
                            if(this.messageDict.hasOwnProperty(messageKey)){
                                if(this.messageDict[messageKey]._id == null){
                                    this._chatService.loadMessage(messageKey)
                                        .subscribe(
                                            message => {
                                                this.messageDict[message._id] = message;
                                            },
                                            error => {
                                                console.log(error.message);
                                            }
                                        );
                                }
                            }
                        }
                    },
                    error => {
                        console.log(error.message);
                    }
                );
        }
    }

    sendNewMessage(content:string, conversationId:string) {
        console.log(content);
        console.log(conversationId);
        if (conversationId) {

            this._chatService.sendNewMessage(content, conversationId)
                .subscribe(
                    (res) => {
                        console.log(res);
                        this.loadConversations();
                    }
                )
        }
    }

    onSelect(conversation:Conversation) {
        console.log("onSelect");
        this.actConversation = conversation;
    }
}

