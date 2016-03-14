import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";
import {AfterViewChecked} from "angular2/core";
import {OnDestroy} from "angular2/core";

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Router} from "angular2/router";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';

import {ProfileService, User,ProfileFriend,Messages, Timeline} from "../services/profile.service";
import {RouterLink} from "angular2/router";
import {Inject} from "angular2/core";
import {ChatService} from "../services/chat.service";
import {FriendsService} from "../services/friendsService";
import {TimelineService} from "../services/timeline.service";
import {Post} from "../services/timeline.service";
import {TimeLinePostComponent} from "../stream/post.component";

@Component({
    selector: 'Profile',
    directives: [TimeLinePostComponent],
    providers:[TimeLinePostComponent,ProfileService,FriendsService,ChatService,TimelineService],

    templateUrl: './app/profile/profile.html',
})

export class Profile implements OnInit, OnDestroy{

    messages:Messages[];
    friends:ProfileFriend[];

    user = new User();
    username;

    isMe = false;
    addFriendButton=true;

    router:Router

    interval

    constructor(
        private _router: Router,
        private _profileService: ProfileService,
        private _routeParams:RouteParams,
        private _friendsService:FriendsService,
        private _chatService:ChatService) {

        this.username = this._routeParams.get('id');

        if(this.username == null){
            this.username = localStorage.getItem('username');
            this.isMe = true;
        }else if(this.username == localStorage.getItem('username')){
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
            //this.interval = setInterval(() => this.loadTimeline(), 2000 );
        }
    }

    ngOnDestroy() {
        clearInterval(this.interval);
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


    //loadTimeline(){
    //    if(this.username) {
    //        this._timelineService.loadTimeline(this.username);
    //    }
    //}


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

    sendMessage(){
        if(this.username) {
            this._chatService.newConversation(this.username)
                .subscribe(
                    response => {
                        console.log(response);
                        this._router.navigateByUrl('/chat');
                    },
                    error => { console.log(error.message);}
                )
        }
    }
}

