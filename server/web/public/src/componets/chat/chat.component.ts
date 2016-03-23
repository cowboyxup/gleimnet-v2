import {Component} from 'angular2/core';
import {ChatThreads} from "./ChatThreads";
import {ChatWindow} from "./ChatWindow";
import {UserService} from "../../services/chat/UserService";
import {ThreadsService} from "../../services/chat/ThreadsService";
import {MessagesService} from "../../services/chat/MessagesService";
import {ChatExampleData} from "./ChatExampleData";
import {ProtectedDirective} from "../../directives/protected.directive";
import {ChatService} from "../../services/chat.service";


@Component({
    selector: 'Chat',
    directives: [
        ChatThreads,
        ChatWindow,
        ProtectedDirective
    ],
    template: `
<div protected>
    <div class="row">
        <div class="col s4">
            <chat-threads></chat-threads>
        </div>
        <div class="col s8">
            <chat-window></chat-window>
        </div>
    </div>
</div>
  `
})
export class Chat {

    constructor(public messagesService: MessagesService,
                public threadsService: ThreadsService,
                public userService: UserService) {
        ChatExampleData.init(messagesService, threadsService, userService);
    }
}

