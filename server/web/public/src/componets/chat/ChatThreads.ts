import {
    Component,
    OnInit,
    ChangeDetectionStrategy
} from 'angular2/core';

import {Observable} from 'rxjs';
import {ThreadsService} from "../../services/chat/ThreadsService";
import {Thread} from "../../models";

@Component({
    inputs: ['thread'],
    selector: 'chat-thread',
    template: `
    <a (click)="clicked($event)" class="div-link">
<li class="collection-item avatar" [ngClass]="{active: selected}">
    <img src="{{thread.avatarSrc}}" alt="" class="circle">
    <span class="title">{{thread.name}} <span *ngIf="selected">&bull;</span></span>
    
    <p>{{thread.lastMessage.text}}</p>
 
</li>
 </a>`
})
class ChatThread implements OnInit {
    thread:Thread;
    selected:boolean = false;

    constructor(public threadsService:ThreadsService) {
    }

    ngOnInit():void {

        this.threadsService.currentThread
            .subscribe((currentThread:Thread) => {
                this.selected = currentThread &&
                    this.thread &&
                    (currentThread.id === this.thread.id);
            });
    }

    clicked(event:any):void {
        this.threadsService.setCurrentThread(this.thread);
        event.preventDefault();
    }
}


@Component({
    selector: 'chat-threads',
    directives: [ChatThread],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <!-- conversations -->
    <div class="card">
        <div class=" scroll">
        
            <ul class="collection">
                <chat-thread class="collection-item avatar"
                    *ngFor="#thread of threads | async"
                    [thread]="thread">
                </chat-thread>
            </ul>
           
        </div>
    </div>
    
    
  `
})
export class ChatThreads {
    threads:Observable<any>;

    constructor(public threadsService:ThreadsService) {
        this.threads = threadsService.orderedThreads;
    }
}
