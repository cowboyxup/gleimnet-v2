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

   constructor(){
       console.log("lol");

       var origin = location.origin;

       var socket = io.connect(origin, {path :"/api/chat"});

       var password =  localStorage.getItem('AuthKey');
       var username = localStorage.getItem('username')

       let body = JSON.stringify({username,  password});

       socket.on('connect', function(){
           socket.emit('authentication', body);
           socket.on('authenticated', function() {
               // use the socket as usual
           });
       });

       this.socket = socket;
   }

    public sendMessage(content){
        //let body = JSON.stringify({content });
        //
        //this.ws.send(body);
        //this.message = '';
    }

}

