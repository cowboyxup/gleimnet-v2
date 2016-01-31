import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Router} from "angular2/router";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';

import {ProfileService,User,ProfileFriend,Messages, Timeline} from "./profile.service";
import {FriendsService} from "../friends/friendsService";

@Component({
    selector: 'Profile',
    templateUrl: './app/home/home.html',
    providers:[ProfileService,FriendsService]

})

export class Profile implements OnInit{

    messages:Messages[];
    friends:ProfileFriend[];

    user = new User();
    username;

    isMe = false;
    addFriendButton=true;


    constructor(private _routeParams:RouteParams,
                private _profileService: ProfileService,
                private _friendsService:FriendsService) {
        this.username = this._routeParams.get('id');

        if(this.username == localStorage.getItem('username')){
            this.isMe = true;
        }else {
            this.isMe = false;
        }
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
                        this.user.dateString = this._profileService.getDateString(this.user.birthdate);
                        this.friends = this.user.friends;
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

    addAsFriend(){
        if(this.username) {
            this._friendsService.requestFriendship(this.username)
                .subscribe(
                    response => {
                        this.addFriendButton = false;
                    },
                    error => { console.log(error.message);}
                )
        }
    }
}

