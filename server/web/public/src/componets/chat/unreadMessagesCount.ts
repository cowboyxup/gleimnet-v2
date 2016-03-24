import {Component, OnInit} from 'angular2/core';
import {Message, Thread} from '../../models';
import * as _ from 'underscore';
import {MessagesService} from "../../services/chat/MessagesService";
import {ThreadsService} from "../../services/chat/ThreadsService";

@Component({
  selector: 'unreadMessagesCount',
  template: `
        <span *ngIf="unreadMessagesCount > 0" class="badge">{{unreadMessagesCount}}</span>
  `
})

export class UnreadMessagesCount implements OnInit {ß
  unreadMessagesCount: number = 0;

  constructor(public messagesService: MessagesService,
              public threadsService: ThreadsService) {
  }

  ngOnInit(): void {
    this.messagesService.messages
      .combineLatest(
        this.threadsService.currentThread,
        (messages: Message[], currentThread: Thread) =>
          [currentThread, messages] )

      .subscribe(([currentThread, messages]: [Thread, Message[]]) => {
        this.unreadMessagesCount =
          _.reduce(
            messages,
            (sum: number, m: Message) => {
              let messageIsInCurrentThread: boolean = m.thread &&
                currentThread &&
                (currentThread.id === m.thread.id);
              if (m && !m.isRead && !messageIsInCurrentThread) {
                sum = sum + 1;
              }
              return sum;
            },
            0);
      });
  }
}

