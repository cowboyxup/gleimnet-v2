import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";
import {OnDestroy} from "angular2/core";
import {RouteParams, RouteData} from 'angular2/router';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {ProfileService} from "../services/profile.service";
import {ChatService} from "../services/chat.service";
import {FriendsService} from "../services/friendsService";
import {TimelineService} from "../services/timeline.service";
import {TimeLinePostComponent} from "./stream/post.component";
import {ProtectedDirective} from "../directives/protected.directive";
import {AuthService} from "../services/auth.service";
import {FormatedDateFromStringPipe} from "../util/dateFormat.pipe";
import {User, Post} from "../models";
import {FriendListItemComponent} from "./friends/friendListItem.component";
import {SortByPropertyPipe} from "../util/sort-by-property-pipe";

@Component({
    selector: 'Profile',
    directives: [
        ProtectedDirective,
        FriendListItemComponent,
        TimeLinePostComponent
    ],
    pipes: [
        FormatedDateFromStringPipe,
        SortByPropertyPipe
    ],
    template: `
        <div protected>

            <div class="titelImage" style="background-image:url('assets/img/titelImage/schiller.png')">
                <img *ngIf="user.avatar" class="thumbnail profilimage" src="{{user.avatar}}" alt="...">
            </div>

            <div class="profile_name_box card">
                <div class="mdl-card__supporting-text">
        <span class="head_profil_name">
            {{user.givenName}} {{user.nickname}}
        </span>
        <span class="head_buttons">
            <button *ngIf="addFriendButton && !isMe" type="button"
                    class="btn send_Button"
                    (click)="addAsFriend()">
                <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                Freund hinzufügen
            </button>

            <!--<button *ngIf="!isMe" type="button"-->
            <!--class="btn send_Button"-->
            <!--(click)="sendMessage()">-->
            <!--<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>-->
            <!--Nachricht senden-->
            <!--</button>-->

        </span>
                </div>
            </div>


            <div class="row">
                <div class="col s3">
                    <div class="card profile_info">
                        <div class="card-content">

                            <h4>Exposé</h4>

                            <h5>Geburtsdatum:</h5>
                            <p>{{user.birthdate | formatedDateFromString}}

                            <h5>Beschreibung:</h5>
                            <p>{{user.description}}</p>

                            <h5>Wirkungsort:</h5>
                            <p>{{user.influenceplace}}</p>

                            <h5>Geburtsort:</h5>
                            <p>{{user.birthplace}}</p>


                            <h5>Freunde:</h5>

                            <div *ngFor="#user of friends" class="row">
                                <friendListItem [user]="user"></friendListItem>
                            </div>

                        </div>
                    </div>
                </div>

                <div class="col s9">
                    <div class="card stream_form">
                        <div class="card-content">
                            <form class="row">
                <span class="input-field col s10">
                    <input #newPosting
                           (keyup.enter)="postNewPosting(newPosting.value); newPosting.value=''"
                           type="text" class="mdl-textfield__input">
                    <label for="comment">
                        Was bewegt Sie?
                    </label>
                </span>
                <span class="input-group-btn col s1">
                    <button class="waves-effect waves-light btn send_Button"
                            (click)="postNewPosting(newPosting.value); newPosting.value='' ">
                        <i class="large material-icons">send</i>
                    </button>
                 </span>
                            </form>
                        </div>
                    </div>

                    <div *ngIf="timelineAvailable">
                        <div class="posting" *ngFor="#posting of posts | sortByProperty : 'timeCreated'">
                            <posting [posting]="posting"></posting>
                        </div>
                    </div>

                    <div *ngIf="!timelineAvailable" class="posting">
                        <div class="mdl-card mdl-shadow--4dp mdl-cell mdl-cell--12-col stream_form">

                            <div class="spinner">
                                <div class="bounce1"></div>
                                <div class="bounce2"></div>
                                <div class="bounce3"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
`
})

export class ProfileComponent implements OnInit, OnDestroy {

    addFriendButton = true;
    interval

    isMe = false;
    timelineAvailable:boolean = false;
    userId:string;
    private user = new User("");
    private posts:Array<Post>;
    private friends:Array<User>;


    tp:string;

    constructor(private _routeParams:RouteParams,
                private _profileService:ProfileService,
                private _authService:AuthService,
                private _timelineService:TimelineService,
                private _friendsService:FriendsService,
                private _chatService:ChatService) {

        this.posts = new Array<Post>();
        this.userId = this._routeParams.get('id');

        if (this.userId == null) {
            this.isMe = true;
            this.userId = this._authService.getUserId();
        } else if (this.userId == this._authService.getUserId()) {
            this.isMe = true;
        } else {
            this.isMe = false;
        }

        this._timelineService.postSubject
            .subscribe(post => {
                    this.posts.push(post);
                    this.timelineAvailable = true;
                }
            );

        this._profileService.getUserForId(this.userId)
            .subscribe(user=> {
                if (user != null) {
                    this.init(user);
                }
            });

        this._friendsService.friends.subscribe((users:Array<User>)=> {
            this.friends = users;
        });

    }

    ngOnInit():void {
        this._friendsService.loadFriends();
    }

    init(user:User) {
        this.user = user
        console.log("timeline: " + this.user.timeline);
        this._timelineService.setTimeLineID(this.user.timeline);
        this.loadTimeline();
        this.interval = setInterval(() => this.loadTimeline(), 2000);
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    loadTimeline() {
        if (this._authService.isAuthenticated()) {
            this._timelineService.load();
        }
    }


    postNewPosting(content:string) {
        if (this._authService) {
            this._timelineService.postNewPosting(content);
        }
    }


    addAsFriend() {
        if (this._authService.isAuthenticated()) {

        }
    }

    sendMessage() {
        if (this._authService.isAuthenticated()) {

        }
    }
}

