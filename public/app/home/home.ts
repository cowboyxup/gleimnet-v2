import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';

import {ProfileService,User,ProfileFriend,Messages, Timeline} from "./profile.service";

import {autKey} from "../common/consts";

@Component({
    selector: 'Home',
    templateUrl: './app/home/home.html',
    providers:[ProfileService]
})

export class Home implements OnInit{

    messages:Messages[];
    friends:ProfileFriend[];

    user = new User();
    username;

    isMe = true;

    constructor(private _profileService: ProfileService) {
        this.username = localStorage.getItem('username');
    }

    ngOnInit() {
        var basicAuth =  localStorage.getItem('AuthKey');
        if(basicAuth){
            this.loadProfilInfos();
            this.loadTimeline();
        }
    }

    loadProfilInfos(){
        if(this.username){
            this._profileService.loadProfilInfos(this.username)
                .subscribe(
                    (res:User) => {
                        this.user = res;

                    },
                    error => {console.log(error.message);}
                )
        }
    }


    loadTimeline(){
        if(this.username){
            this._profileService.loadTimeline(this.username)
                .subscribe(
                    (res:Timeline) => {this.messages = res.messages; },
                    error => { console.log(error.message);}
                );
        }
    }

    postNewPosting(content:string){
        if(this.username){
            this._profileService.postNewPosting(this.username, content)
                .subscribe(
                    response => {
                        this.loadTimeline();
                    },
                    error => { console.log(error.message);}
                );
        }
    }

    commentOnPosting(content:string, postId:string){
        if(this.username){
            this._profileService.commentOnPosting(content, postId)
                .subscribe(
                    response => {
                        this.loadTimeline();
                    },
                    error => { console.log(error.message);}
                );
        }
    }
}
