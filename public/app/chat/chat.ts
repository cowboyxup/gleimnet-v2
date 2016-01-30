import {Component} from 'angular2/core';

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {ChatService} from "./chat.service";


@Component({
    selector: 'Chat',
    templateUrl: './app/chat/chat.html',
    providers:[ChatService]
})

export class Chat {

    constructor(private _chatService: ChatService) {
        //this._chatService.sendMessage("lol");
    }


}