import {Component} from 'angular2/core';
import {ChatThreads} from "./ChatThreads";
import {ChatWindow} from "./ChatWindow";

import {ProtectedDirective} from "../../directives/protected.directive";

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
                <div class="col s4" style="background-color: #00acc1">
                    <chat-threads></chat-threads>
                </div>
                <div class="col s8" style="background-color: #6a1b9a">
                    <chat-window></chat-window>
                </div>
            </div>
        </div>
    `
})

export class Chat {
}

