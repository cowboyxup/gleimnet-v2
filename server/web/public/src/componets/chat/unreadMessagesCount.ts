import {Component, OnInit} from 'angular2/core';
import {ChatService} from "../../services/chat.service";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'unreadMessagesCount',
  template: `
        <span *ngIf="unreadMessagesCount > 0" class="badge">{{unreadMessagesCount}}</span>
  `
})

export class UnreadMessagesCount implements OnInit {
    private intervalConversationsReload;
    private isStartet = false;

    constructor(public chatService: ChatService,
              public _authService: AuthService) {

        this._authService.authenticated$
            .subscribe((isAuthenticated: boolean) => {
                if (isAuthenticated) {
                    this.chatService.loadConversations();

                    if (!this.isStartet) {
                        this.isStartet = true;
                        this.intervalConversationsReload = setInterval(() => this.chatService.loadConversations(), 5000);

                    }
                }
            });
  }

  ngOnInit(): void {
    // this.messagesService.messages
    //   .combineLatest(
    //     this.threadsService.currentThread,
    //     (messages: Message[], currentThread: Thread) =>
    //       [currentThread, messages] )
    //
    //   .subscribe(([currentThread, messages]: [Thread, Message[]]) => {
    //     this.unreadMessagesCount =
    //       _.reduce(
    //         messages,
    //         (sum: number, m: Message) => {
    //           let messageIsInCurrentThread: boolean = m.thread &&
    //             currentThread &&
    //             (currentThread._id === m.thread._id);
    //           if (m && !m.isRead && !messageIsInCurrentThread) {
    //             sum = sum + 1;
    //           }
    //           return sum;
    //         },
    //         0);
    //   });
  }
}

