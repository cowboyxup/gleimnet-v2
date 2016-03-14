import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";
import {AfterViewChecked} from "angular2/core";
import {OnDestroy} from "angular2/core";
import {RouterLink} from "angular2/router";
import {Inject} from "angular2/core";
import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Router} from "angular2/router";

import {Observable} from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';

import {ProfileService, User,ProfileFriend,Messages, Timeline} from "../../services/profile.service";
import {ChatService} from "../../services/chat.service";
import {FriendsService} from "../../services/friendsService";
import {TimelineService} from "../../services/timeline.service";
import {Post} from "../../services/timeline.service";
import {TimeLinePostComponent} from "../stream/post.component";
import {ProtectedDirective} from "../../directives/protected.directive";

@Component({
    selector: 'Profile',
    directives: [
        TimeLinePostComponent,
        ProtectedDirective
    ],
    providers:[
        TimeLinePostComponent,
        ProfileService,
        FriendsService,
        ChatService,
        TimelineService
    ],

    template: `
        <div protected>

<div class="titelImage" style="background-image:url('img/banner/banner_{{user.username}}.jpg')">

    <img *ngIf="user.username" class="thumbnail profilimage" src="img/profilimages/240x240/{{user.avatar}}.png"
                 alt="...">

</div>

    <div class="profile_name_box mdl-card mdl-shadow--4dp">
        <div class="mdl-card__supporting-text">
        <h4>
            {{user.givenName}} {{user.surename}}
        </h4>
        <div class="row">
            <button *ngIf="addFriendButton && !isMe" type="button"
                    class="btn btn-default btn-sm pull-right"
                    (click)="addAsFriend()">
                <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                Freund hinzufügen
            </button>

            <button *ngIf="!isMe" type="button"
                    class="btn btn-default btn-sm pull-right"
                    (click)="sendMessage()">
                <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                Nachricht senden
            </button>
        </div>
        </div>
    </div>


<div class="mdl-grid">
    <div class="mdl-cell mdl-cell--3-col">
        <div class="mdl-card mdl-shadow--4dp mdl-cell mdl-cell--12-col profile_info">
            <div class="mdl-card__supporting-text">
                <div class="row">
                    <h4>Geburtsdatum:</h4>
                    <p>{{userateString}}
                    <h4>Info:</h4>
                    <p>{{userescription}}</p>
                </div>


                <h4>Freunde</h4>
                <div class="col-md-4 friendImage" *ngFor="#Friend of friends">
                    <div class="mdl-color-text--grey-700 posting_header meta">
                        <a class="" href="#/profile/{{Friend.username}}" role="button">
                            <img src="img/profilimages/64x64/{{Friend.username}}.png" class="round_avatar">
                        </a>
                        <div class="comment__author">
                            <strong>{{Friend.givenName}}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="mdl-cell mdl-cell--9-col">
        <div class="mdl-card mdl-shadow--4dp mdl-cell mdl-cell--12-col stream_form">
            <form>
                <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                    <input #newPosting
                           (keyup.enter)="postNewPosting(newPosting.value); newPosting.value=''"
                           type="text" class="mdl-textfield__input">
                    <label for="comment" class="mdl-textfield__label">
                        Was bewegt Sie?
                    </label>
                </div>
                <button class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon"
                        (click)="postNewPosting(newPosting.value); newPosting.value=''">
                    <i class="material-icons" role="presentation">check</i><span
                        class="visuallyhidden">add comment</span>
                </button>
            </form>
        </div>
        <div class="posting" *ngFor="#posting of messages ">
            <posting [posting]="posting"></posting>
        </div>

    </div>
</div>

<hr>

</div>
`
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

