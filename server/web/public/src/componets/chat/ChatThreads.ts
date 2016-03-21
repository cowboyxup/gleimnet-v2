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
<div class="media conversation card">

<a (click)="clicked($event)" class="div-link">
  <div class="card-content">
    
    <span class="card-title activator grey-text text-darken-4">
        <img class=" round_avatar48 avatar_left" src="{{thread.avatarSrc}}">
        {{thread.name}}
        <span *ngIf="selected">&bull;</span>
    </span>
      
    <div class="media-body">
      <small class="message-preview">{{thread.lastMessage.text}}</small>
    </div>
    
  </div>
  </a>
</div>
  `
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
    <div class="row">
      <div class="conversation-wrap">

        <chat-thread
             *ngFor="#thread of threads | async"
             [thread]="thread">
        </chat-thread>

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
