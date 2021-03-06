import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";
import {OnDestroy} from "angular2/core";
import {RouteParams, RouteData} from 'angular2/router';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {ProfileService} from "../services/profile.service";
import {ChatService, Conversation} from "../services/chat.service";
import {FriendsService} from "../services/friends.service";
import {TimelineService} from "../services/timeline.service";
import {TimeLinePostComponent} from "./stream/post.component";
import {ProtectedDirective} from "../directives/protected.directive";
import {AuthService} from "../services/auth.service";
import {User, Post, IdInterface, indexOfId} from "../models";
import {FriendListItemComponent} from "./friends/friendListItem.component";
import {SortByPropertyPipe} from "../util/sort-by-property-pipe";
import {ProfileInfoComponent} from  "./profileinfo.componente";

@Component({
    selector: 'Profile',
    directives: [
        ProtectedDirective,
        FriendListItemComponent,
        TimeLinePostComponent,
        ProfileInfoComponent
    ],
    pipes: [
        SortByPropertyPipe
    ],
    template: `
        <div protected> 

            <div class="titelImageContainer">
                <img class="titelImage" src="{{user.titlePicture}}">
                <img *ngIf="user.avatar" class="thumbnail profilimage" src="{{user.avatar}}" alt="...">
            </div>

            <div class="profile_name_box card">
                <div class="mdl-card__supporting-text">
        <span class="head_profil_name">
            {{user.givenName}} {{user.surname}}
        </span>
        <span class="head_buttons">
        
            <button *ngIf="addFriendButton && !isMe" type="button"
                    class="btn"
                    (click)="addAsFriend()">
                <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                Freund hinzufügen
            </button>

            
            <button *ngIf="!isMe" data-target="modal1" class="btn modal-trigger"
                onclick="$('#modal1').openModal();" >Nachricht schreiben</button>
            
            <div id="modal1" class="modal">
                <div class="modal-content">
                    <h4>Nachricht an {{user.nickname}}</h4>
                    <div class="input-field col s12">
                        <textarea #newMessage id="textarea1" class="materialize-textarea"></textarea>
                        <label for="textarea1">Nachricht</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class=" modal-action modal-close waves-effect btn-flat"
                        onclick="$('#modal1').closeModal();"
                        (click)="sendMessage(newMessage.value)">
                            senden</button>
                    <button class=" modal-action modal-close waves-effect btn-flat"
                        onclick="$('#modal1').closeModal();">
                            abbrechen
                    </button>
                </div>
             </div>

        </span>
                </div>
            </div>


            <div class="row">
                <div class="col s3">

                    
                    <profileInfo [user]="user"></profileInfo>
                        
                    <div class="card profile_info">
                        <div class="card-content">

                            <h5>Freunde:</h5>

                            <div *ngFor="#userId of friends" class="row">
                                <friendListItem [userId]="userId"></friendListItem>
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
                                    <button class="waves-effect waves-light btn"
                                            (click)="postNewPosting(newPosting.value); newPosting.value='' ">
                                        <i class="large material-icons">send</i>
                                    </button>
                                </span>
                            </form>
                        </div>
                    </div>

                    <div>
                        <div class="posting" *ngFor="#posting of posts | sortByProperty : 'timeCreated'">
                            <posting [posting]="posting"></posting>
                        </div>
                    </div>

                  

                </div>
            </div>
        </div>
`
})

export class ProfileComponent implements OnInit, OnDestroy {

    addFriendButton = false;

    isMe = false;
    // timelineAvailable: boolean = false;
    userId: string;

    private interval;

    private user = new User();
    private posts: Array<Post>;
    private friends: Array<IdInterface>;

    constructor(private _routeParams: RouteParams,
                private _profileService: ProfileService,
                private _authService: AuthService,
                private _timelineService: TimelineService,
                private _friendsService: FriendsService,
                private _chatService: ChatService) {

        this.posts = [];
        this.userId = this._routeParams.get('id');

        if (this.userId === null) {
            this.isMe = true;
            this.userId = this._authService.getUserId();
        } else if (this.userId === this._authService.getUserId()) {
            this.isMe = true;
        } else {
            this.isMe = false;
        }

        this._timelineService.postSubject
            .subscribe(post => {
                    this.posts.push(post);
                    // this.timelineAvailable = true;
                }
            );

        this._profileService.getUserForId(this.userId)
            .subscribe( user => {
                if (user != null) {
                    this.initTimeLine(user);
                    this.friends = user.friends;

                    let indexOfMe = indexOfId(this.friends, this._authService.getUserId());

                    if (indexOfMe !== -1) {
                        this.addFriendButton = false;
                    } else {
                        this._friendsService.loadSendFriendsRequests();
                    }

                }
            });

        //Wenn eine Freundschaftsanfrage besteht
        this._friendsService.sendFriendsRequests.subscribe((users: Array<IdInterface>) => {
            let index = indexOfId(users, this.userId);

            // console.log(users);
            if (index !== -1) {
                this.addFriendButton = false;
            } else {
                this.addFriendButton = true;
            }
        });

        // this._friendsService.friends.subscribe(( users: Array<IdInterface>) => {
        //     this.friends = users;
        // });
    }

    ngOnInit(): void {
        console.log("ngOnInit");

        this._friendsService.loadFriends();

        this._profileService.forceGetUserForId(this.userId)
            .subscribe( user => {
                if (user != null) {

                    console.log("subscribe" + Date.now());

                    this.friends = user.friends;

                    let indexOfMe = indexOfId(this.friends, this._authService.getUserId());

                    if (indexOfMe !== -1) {
                        this.addFriendButton = false;
                    } else {
                        this._friendsService.loadSendFriendsRequests();
                    }

                }
            });
    }

    initTimeLine( user: User ) {

        this.user = user;

        console.log("forceGetUserForId: " + this.user.birthdate );

        console.log("timeline: " + this.user.timeline);

        this._timelineService.setTimeLineID(this.user.timeline);

         this.loadTimeline();
        this.interval = setInterval(() => this.loadTimeline(), 10000);
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    loadTimeline() {

        if (this._authService.isAuthenticated()) {
            this._timelineService.load();
        }
    }


    postNewPosting(content: string) {
        if (this._authService) {
            this._timelineService.postNewPosting(content);
        }
    }


    addAsFriend() {
        if (this._authService.isAuthenticated()) {
            console.log("addAsFriend");
            this._friendsService.requestFriendship(this.user._id);
        }
    }

    sendMessage(content: string) {
        if (this._authService.isAuthenticated()) {
            this._chatService.newConversation(this.userId).subscribe((conversations: Array<Conversation>) => {
                this._chatService.sendNewMessage(content, conversations[0]._id);
            },
            error => {
                console.log("err");
            });
        }
    }

}

