import {Component} from 'angular2/core';


import {ProfileService} from "../../services/profile.service";
import {User} from "../../services/profile.service";
import {ChatService} from "../../services/chat.service";
import {ConversationGroup} from "../../services/chat.service";
import {Conversation} from "../../services/chat.service";
import {Message} from "../../services/chat.service";
import {ProtectedDirective} from "../../directives/protected.directive";


@Component({
    selector: 'Chat',
    directives: [
        ProtectedDirective,
    ],
    template: `
<div protected>
    <div class="container col-md-3 content">

    <div *ngFor="#conversation of myConversations.conversations" class="media post"
         [class.selected]="conversation === actConversation"
         (click)="onSelect(conversation)">
        <div class="media-left">
            <a href="#">
                <img class="media-object timelineImage" alt="" src="img/64x64.svg">
            </a>
        </div>
        <div class="media-body">
            <h5 class="media-heading">
                <div *ngFor="#authors of conversation.authors">
                    {{userDict[authors.id].surename}}
                </div>
            </h5>
        </div>
    </div>
</div>
<div class="container col-md-9 timeline content">
    <div *ngIf="actConversation">
        <!-- Post-->
        <div class="media post" *ngFor="#message of actConversation.messages">
            <div class="media-left">
                <a href="#">
                    <img class="media-object timelineImage" alt="" src="img/profilimages/64x64/{{userDict[messageDict[message.id].author].username}}.png">
                </a>
            </div>
            <div class="media-body">
                <h4 class="media-heading"> {{userDict[messageDict[message.id].author].surename}}</h4>
                {{messageDict[message.id].content}}
            </div>
        </div>

        <div class="row">
            <div class="col-lg-6">
                <div class="input-group">
                    <input #newMessage
                           (keyup.enter)="sendNewMessage(newMessage.value, actConversation._id); newMessage.value=''"
                           type="text" class="form-control" placeholder="...">
                        <span class="input-group-btn">
                            <button (click)="sendNewMessage(newMessage.value, actConversation._id); newMessage.value=''"
                                    class="btn btn-default" type="button">Abschicken
                            </button>
                        </span>
                </div>
                <!-- /input-group -->
            </div>
            <!-- /.col-lg-6 -->
        </div>
        <!-- /.row -->

    </div>
</div>
</div>

    `,
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
                        this.onSelect(this.actConversation);
                    }
                )
        }
    }

    onSelect(conversation:Conversation) {
        console.log("onSelect");
        this.actConversation = conversation;
    }
}

