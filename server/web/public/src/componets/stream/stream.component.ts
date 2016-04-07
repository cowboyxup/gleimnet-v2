import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";
import {OnDestroy} from "angular2/core";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import {TimeLinePostComponent} from "./post.component";
import {ProtectedDirective} from "../../directives/protected.directive";
import {StreamService} from "../../services/stream.service";
import {AuthService} from "../../services/auth.service";
import {Post, User} from "../../models";
import {TimelineService} from "../../services/timeline.service";
import {SortByPropertyPipe} from "../../util/sort-by-property-pipe";
import {ProfileService} from "../../services/profile.service";


@Component({
    selector: 'Stream',
    providers: [
        TimelineService,
        StreamService
    ],
    directives: [
        TimeLinePostComponent,
        ProtectedDirective
    ],
    pipes: [
        SortByPropertyPipe
    ],
    template: `
        <div protected class="">
            <div class="row">
                <div class="col s12">
                    <div class="card">
                        
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
                                        <i class="material-icons">send</i>
                                    </button>
                                </span>
                            </form>
                        </div>
                    </div>
        
                    <div class="posting" *ngFor="#posting of posts | sortByProperty : 'timeCreated'">
                        <posting [posting]="posting"> </posting>
                    </div>
                </div>
            </div>
        </div>
        `
})



export class StreamComponent implements OnInit, OnDestroy {

    private posts: Array<Post> = [];

    private user: User;
    private interval;

    constructor(private _streamService: StreamService,
                private _authService: AuthService,
                private _timelineService: TimelineService,
                private _profileService: ProfileService) {

        this._streamService.postSubject
            .subscribe( post => {
                    this.posts.push(post);
                }
            );


        this._profileService.getUserForId(this._authService.getUserId())
            .subscribe(( user: User ) => {
                this.user = user;
                this._timelineService.setTimeLineID(this.user.timeline);
        });

    }

    ngOnInit() {
        if (this._authService.isAuthenticated()) {
            this._streamService.load();
            this.interval = setInterval(() => this._streamService.load(), 10000 );
        }
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    postNewPosting(content: string) {
        if (this._authService) {
            this._timelineService.postNewPostingWithStream(content).subscribe(
                res => {
                    this._streamService.load();
                },
                error => {
                    console.log(error);
                });
        }
    }

    commentOnPosting(content: string, postId: string) {
        if (this._authService.isAuthenticated()) {
            this._timelineService.commentOnPostingWithStream(content, postId)
               .subscribe(
                   response => {
                       this._streamService.load();
                   },
                   error => {
                       this._streamService.load();
                       console.log(error);
                   }
               );
        }
    }

    onScroll(event) {

        let offsetHeight = document.documentElement.offsetHeight;
        let scrollY =  window.scrollY;
        let innerHeight = window.innerHeight;

        if (scrollY + innerHeight === offsetHeight) {
            console.log('At the bottom');
        }
    }
}
