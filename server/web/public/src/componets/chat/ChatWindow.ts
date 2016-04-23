import {
    Component,
    OnInit,
    ElementRef,
    ChangeDetectionStrategy, Input
} from 'angular2/core';
import {FORM_DIRECTIVES} from 'angular2/common';

import {Observable} from 'rxjs';
import {Message, Thread} from "../../models";
import {FromNowPipe} from "../../util/FromNowPipe";
import {ChatService} from "../../services/chat.service";
import {AuthService} from "../../services/auth.service";
import {ProfileService} from "../../services/profile.service";
import {SortByPropertyAscendingPipe} from "../../util/sort-by-property-ascending.pipe";

@Component({
    inputs: [
        'message'
    ],
    selector: 'chat-message',
    pipes: [
        FromNowPipe]
    ,
    template: `
        <div class=""
               [ngClass]="{'base-sent': !incoming, 'base-receive': incoming}">
            <div class="card-content">
                <div class="comment__author">
                    <a href="#/profile/{{message.author}}">
                        <span class="avatar_left" *ngIf="incoming">
                            <img class="round_avatar" src="{{message.authorAvatar}}">
                        </span>  
                    
                        <span class = "message_auther">{{message.authorName}} • {{message.timeCreated | fromNow}}</span>
                    
                        <span class="avatar_right" *ngIf="!incoming">
                            <img class="round_avatar" src="{{message.authorAvatar}}">
                        </span>
                    </a>
                </div>
                
                <div class="messages"
                  [ngClass]="{'msg-sent': !incoming, 'msg-receive': incoming}">
                  <p class="flow-text">{{message.content}}</p>
                  
                </div>
            </div>
        </div>
  `
})
export class ChatMessage implements OnInit {
    @Input()
    message: Message;
    incoming: boolean;

    constructor(private _authService: AuthService,
                private _profileService: ProfileService) {
    }

    ngOnInit(): void {
        this.incoming = this.message.author !== this._authService.getUserId();


        if ( this.message.author !== null ) {
            this._profileService.getUserForId(this.message.author).subscribe(user => {
                if ( user !== null ) {
                    this.message.authorName = user.givenName;
                    this.message.authorAvatar = user.avatar;
                }
            });
        }
    }

}

@Component({
    selector: 'chat-window',
    directives: [
        ChatMessage,
        FORM_DIRECTIVES
    ],
    pipes: [
        SortByPropertyAscendingPipe
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <div class="card-content">
                <div class="">
                
                    <div class="scroll_messages">
                        <chat-message class="chat-message"
                            *ngFor="#message of messages | sortAscendingByProperty : 'timeCreated' "
                            [message]="message">
                        </chat-message>
                        <div id="endofmassages"></div>
                    </div >
                    
                
                    <div class="row">
    
                        <hr> 
                        
                        <div class="input-field col s10">
                            <input type="text" 
                                (keydown.enter)="onEnter($event)"
                                [(ngModel)]="draftMessage" />
                             <label for="password">Verfasse eine Nachricht</label>
                        </div>
                   
                        <span class="input-group-btn col s1">
                            <button class="waves-effect waves-light btn"
                                (click)="onEnter($event)"><i class="material-icons">send</i></button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ChatWindow implements OnInit {
    messages: Array<Message> = [];
    currentThread: Thread;
    draftMessage: string = "";

    constructor(private _chatService: ChatService) {
    }

    ngOnInit(): void {

        this._chatService.currentThreadSubject.subscribe(
            (thread: Thread) => {
                this.currentThread = thread;
                this.messages = [];
            });

        this._chatService.currentThreadMessagesSubject.subscribe(
            (message: Message) => {
                this.messages.push(message);
                setTimeout(() => {
                    this.scrollToBottom();
                });
            });

        this.scrollToBottom();
    }

    onEnter(event: any): void {
        this.sendMessage();
        event.preventDefault();
    }

    sendMessage(): void {
        this._chatService.sendNewMessage(this.draftMessage, this.currentThread._id);
        this.draftMessage = "";
    }

    scrollToBottom(): void {
        var objDiv = document.getElementById("endofmassages");
        console.log("scoll to end");

        if ( objDiv !== null ) {
            objDiv.scrollIntoView();
        }
    }

}
