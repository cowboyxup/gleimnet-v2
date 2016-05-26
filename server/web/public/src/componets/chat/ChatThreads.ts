import {
    Component,
    OnInit,
    ChangeDetectionStrategy
} from 'angular2/core';

import {Thread} from "../../models";
import {ChatService} from "../../services/chat.service";
import {AuthService} from "../../services/auth.service";
import {ProfileService} from "../../services/profile.service";
import {FromNowPipe} from "../../util/FromNowPipe";
import {SortByPropertyPipe} from "../../util/sort-by-property-pipe";

@Component({
    inputs: [
        'thread'
    ],
    selector: 'chat-thread',
    pipes: [
        FromNowPipe
    ],
    template: `
        <a (click)="clicked($event)" class="div-link">
            <li class="collection-item avatar" [ngClass]="{active: selected}">
                <img src="{{avatar}}" alt="" class="circle">
                <span class="title" >{{thread.name}} 
                    <span *ngIf="unread">&bull;</span>
                </span>
                <p>{{thread.timeUpdated | fromNow}}</p>
            </li>
         </a>
    `
})

class ChatThread implements OnInit {
    thread: Thread;
    selected: boolean = false;
    unread: boolean   = false;
    avatar: string;

    constructor(private _authService: AuthService,
                private _profileService: ProfileService,
                private _chatService: ChatService) {}

    ngOnInit(): void {

        this.unread = this.thread.unread;

        var ChatPartnerId;

        if (this.thread.authorIds[0] !==  this._authService.getUserId()) {
            ChatPartnerId = this.thread.authorIds[0];
        } else {
            ChatPartnerId = this.thread.authorIds[1];
        }

        this._profileService.getUserForId(ChatPartnerId).subscribe( user => {
            if (user !== null) {
                this.avatar = user.avatar;
                this.thread.name = user.nickname;
            }
        });

        this._chatService.currentThreadSubject
            .subscribe((currentThread: Thread) => {
                this.selected =
                    currentThread &&
                    this.thread &&
                    (currentThread._id === this.thread._id);

            });

        // this._chatService.currentThreadSubject.subscribe(
        //     (thread: Thread) => {
        //         this.unread = true;
        //     });

    }

    clicked(event: any): void {
        this._chatService.setCurrentThread(this.thread);
        event.preventDefault();

        this._chatService.markConversationAsRead(this.thread._id);
        this.unread = false;
    }
}


@Component({
    selector: 'chat-threads',
    directives: [
        ChatThread
    ],
    //changeDetection: ChangeDetectionStrategy.OnPush,

    template: `
        <div class="card">
            <div class=" scroll">
            
                <ul class="collection">
                    <chat-thread *ngFor="#thread of threads" [thread]="thread"> 
                        
                    </chat-thread>
                </ul>
               
            </div>
        </div>
        `
})
export class ChatThreads {

    threads: Array<Thread>;

    constructor(public _chatService: ChatService) {

        this._chatService.threads$.subscribe(updatedThreads => {
            this.threads = updatedThreads;
            console.log("threds: " + this.threads);
        });

        //this._chatService.loadConversations();

    }

    ngOnInit(): void {
        console.log("ngOnInit");
    }
}
