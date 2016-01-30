import {Injectable} from 'angular2/core';
import {Headers} from "angular2/http";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {error} from "util";

//noinspection TypeScriptCheckImport
import * as io from 'node_modules/socket.io-client/socket.io.js';

@Injectable()
export class ChatService {

    messages = [];
    message = '';

    socket

    socketIsOpen:boolean = false;

   constructor(){
       var origin = location.origin;

       var socket = io.connect(origin, {path :"/api/chat"});

       var auth =  localStorage.getItem('AuthKey');
       var username = localStorage.getItem('username')

       let body = JSON.stringify({ auth});



       socket.on('connect', function(){
           socket.emit('authentication', body);
           socket.on('authenticated', function() {
               // use the socket as usual

               this.socketIsOpen = true;

              // socket.emit('join-conversation','56ac968fb047f7f003dd828f');

               socket.on('message',function(content){
                   this.getMessage(content);
               })

               socket.on('disconnect', function(){
                   this.socketIsOpen = false;
               });
           });
       });


       this.socket = socket;
   }

    public sendMessage(content){
        if(this.socketIsOpen){
            this.socket.emit('message','56ac968fb047f7f003dd828f')
        }
    }

    private getMessage(content:any):void {
        console.log(content);
    }
}

export class Conversation{
    _id:string;
    users:ConversationUser[];
    messages:Message[];
}

export class Message{
    author:ConversationUser;
    time:string;
    content:string;
}

export class ConversationUser{
    username:string;
}