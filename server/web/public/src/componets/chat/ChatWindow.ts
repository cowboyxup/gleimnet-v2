import {
    Component,
    OnInit,
    ElementRef,
    ChangeDetectionStrategy
} from 'angular2/core';
import {FORM_DIRECTIVES} from 'angular2/common';

import {Observable} from 'rxjs';
import {Message, Thread} from "../../models";
import {User} from "../../models";
import {UserService} from "../../services/chat/UserService";
import {FromNowPipe} from "../../util/FromNowPipe";
import {MessagesService} from "../../services/chat/MessagesService";
import {ThreadsService} from "../../services/chat/ThreadsService";

@Component({
    inputs: ['message'],
    selector: 'chat-message',
    pipes: [FromNowPipe],
    template: `
<div class="card"
       [ngClass]="{'base-sent': !incoming, 'base-receive': incoming}">
    <div class="card-content">
    <div class="card-title activator grey-text text-darken-4">
        <span class="avatar_left" *ngIf="incoming">
            <img class="round_avatar" src="{{message.author.avatarSrc}}">
        </span>  
        
        <span class = "message_auther">{{message.author.name}} • {{message.sentAt | fromNow}}</span>
        
        <span class="avatar_right" *ngIf="!incoming">
            <img class="round_avatar" src="{{message.author.avatarSrc}}">
        </span>
    
    </div>
    
    <div class="messages"
      [ngClass]="{'msg-sent': !incoming, 'msg-receive': incoming}">
      <p>{{message.text}}</p>
      
    </div>
    </div>
   
</div>
  `
})
export class ChatMessage implements OnInit {
    message:Message;
    currentUser:User;
    incoming:boolean;

    constructor(public userService:UserService) {
    }

    ngOnInit():void {
        this.userService.currentUser
            .subscribe(
                (user:User) => {
                    this.currentUser = user;
                    if (this.message.author && user) {
                        this.incoming = this.message.author._id !== user._id;
                    }
                });
    }

}

@Component({
    selector: 'chat-window',
    directives: [ChatMessage,
        FORM_DIRECTIVES],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
            <div class="panel-body msg-container-base">
              <chat-message
                   *ngFor="#message of messages | async"
                   [message]="message">
              </chat-message>
            </div>

            <div class="panel-footer card">
              <div class="card-content">
                <div class="row">

                <div class="input-field col s10">
                 <input type="text" 
                       (keydown.enter)="onEnter($event)"
                       [(ngModel)]="draftMessage.text" />
                 <label for="password">Verfasse eine Nachricht</label>
                </div>
               
                <span class="input-group-btn col s1">
                  <button class="waves-effect waves-light btn send_Button"
                     (click)="onEnter($event)"
                     >Send</button>
                </span>
              </div>
              </div>
            </div>
  `
})
export class ChatWindow implements OnInit {
    messages:Observable<any>;
    currentThread:Thread;
    draftMessage:Message;
    currentUser:User;

    constructor(public messagesService:MessagesService,
                public threadsService:ThreadsService,
                public userService:UserService,
                public el:ElementRef) {
    }

    ngOnInit():void {


        this.messages = this.threadsService.currentThreadMessages;

        this.draftMessage = new Message();

        this.threadsService.currentThread.subscribe(
            (thread:Thread) => {
                this.currentThread = thread;
            });

        this.userService.currentUser
            .subscribe(
                (user:User) => {
                    this.currentUser = user;
                });

        this.messages
            .subscribe(
                (messages:Array<Message>) => {
                    setTimeout(() => {
                        this.scrollToBottom();
                    });
                });
    }

    onEnter(event:any):void {
        this.sendMessage();
        event.preventDefault();
    }

    sendMessage():void {
        let m:Message = this.draftMessage;
        m.author = this.currentUser;
        m.thread = this.currentThread;
        m.isRead = true;
        this.messagesService.addMessage(m);
        this.draftMessage = new Message();
    }

    scrollToBottom():void {
        let scrollPane:any = this.el
            .nativeElement.querySelector('.msg-container-base');
        scrollPane.scrollTop = scrollPane.scrollHeight;
    }

}
