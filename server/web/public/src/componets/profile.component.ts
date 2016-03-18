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

import {ProfileService, User,ProfileFriend,Messages, Timeline} from "../services/profile.service";
import {ChatService} from "../services/chat.service";
import {FriendsService} from "../services/friendsService";
import {TimelineService} from "../services/timeline.service";
import {Post} from "../services/timeline.service";
import {TimeLinePostComponent} from "./stream/post.component";
import {ProtectedDirective} from "../directives/protected.directive";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import {AuthService} from "../services/auth.service";
import {FormatedDateFromStringPipe} from "../pipes/dateFormat.pipe";

@Component({
    selector: 'Profile',
    directives: [
        TimeLinePostComponent,
        ProtectedDirective
    ],
    providers:[
        TimelineService
    ],
    pipes: [FormatedDateFromStringPipe],
    template: `
        <div protected>

<div class="titelImage" style="background-image:url('assets/{{user.titlePicture}}')">

    <img *ngIf="user.username" class="thumbnail profilimage" src="assets/{{user.avatar}}"
                 alt="...">

</div>

    <div class="profile_name_box mdl-card mdl-shadow--4dp">
        <div class="mdl-card__supporting-text">
        <h4>
            {{user.givenName}} {{user.username}}
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
                <h5>Geburtsdatum:</h5>
                <p>{{user.birthdate | formatedDateFromString}}
                <h5>Info:</h5>
                <p>{{user.description}}</p>


                <h5>Freunde:</h5>
                <div class="col-md-4 friendImage" *ngFor="#Friend of friends">
                    <div class="mdl-color-text--grey-700 posting_header meta">
                        <a class="" href="#/profile/{{Friend.username}}" role="button">
                            <img src="img/profilimages/64x64/{{Friend.avatar}}.png" class="round_avatar">
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
        <div class="posting" *ngFor="#posting of posts ">
            <posting [posting]="posting"></posting>
        </div>

    </div>
</div>

<hr>

</div>
`
})

export class ProfileComponent implements OnInit, OnDestroy{

    friends:ProfileFriend[];
    isMe = false;
    addFriendButton=true;
    router:Router
    interval


    userId:string;
    private user = new User()
    private posts:Array<Post>;

    constructor(
        private _router: Router,
        private _routeParams:RouteParams,
        private _profileService: ProfileService,
        private _authService:AuthService, private _timelineService:TimelineService ) {

        this.posts = new Array<Post>();
        this.userId = this._routeParams.get('id');

        if(this.userId == null){
            this.isMe = true;
            this.userId = this._authService.getUserId();
        }else if(this.userId == this._authService.getUserId()){
            this.isMe = true;
        }else {
            this.isMe = false;
        }

    }

    ngOnInit(): void {
        this._profileService.user$
            .subscribe((user: User) => {
                    this.user = user;
                    this.loadTimeline(this.user.timeline);
                }
            );
        //
        this.loadProfilInfos();
        this.loadTimeline();

            //this.interval = setInterval(() => this.loadTimeline(), 2000 );

        this._profileService.getUserWithID(this.userId);

        this._timelineService.posts$
            .subscribe(posts => {
                    this.posts = posts;
                }
            );
    }


    ngOnDestroy() {
        clearInterval(this.interval);
    }

    loadProfilInfos(){
        if(this._authService.isAuthenticated()){
            this._profileService.loadProfilInfosWithID(this.userId);
        }
    }


    loadTimeline(timeLineId:string){
        if(this._authService.isAuthenticated()){
            this._timelineService.load(timeLineId);
        }
    }


    postNewPosting(content:string){
        if(this._authService){
            this._timelineService.postNewPosting(content);
        }
    }

    commentOnPosting(content:string, postId:string){
        if(this._authService.isAuthenticated()){
            //this._profileService.commentOnPosting(content, postId)
            //    .subscribe(
            //        response => {
            //            this.loadTimeline();
            //        },
            //        error => { console.log(error);}
            //    );
        }
    }

    addAsFriend(){
        if(this._authService.isAuthenticated()) {
            //this._friendsService.requestFriendship(this.userId)
            //    .subscribe(
            //        response => {
            //
            //            this.addFriendButton = false;
            //        },
            //        error => { console.log(error.message);}
            //    )
        }
    }

    sendMessage(){
        if(this._authService.isAuthenticated()) {
            //this._chatService.newConversation(this.userId)
            //    .subscribe(
            //        response => {
            //            console.log(response);
            //            this._router.navigateByUrl('/chat');
            //        },
            //        error => { console.log(error.message);}
            //    )
        }
    }
}

