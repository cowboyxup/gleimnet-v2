import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";
import {Control} from "angular2/common";
import {OnDestroy} from "angular2/core";

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import {TimeLinePostComponent} from "./post.component";
import {ProtectedDirective} from "../../directives/protected.directive";
import {StreamService} from "../../services/stream.service";
import {AuthService} from "../../services/auth.service";
import {Post} from "../../models";
import {TimelineService} from "../../services/timeline.service";


@Component({
    selector: 'Stream',
    providers:[StreamService],
    directives: [
        TimeLinePostComponent,
        ProtectedDirective
    ],

    template: `
<div protected class="container">
    <div class="row">

     
        <div class="card col s12">
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
    </div>   
       

    <div class="posting" *ngFor="#posting of myArray ">
        <posting [posting]="posting"> </posting>
    </div>
</div>
`

})



export class Stream implements OnInit,OnDestroy{

    private posts:Array<Post>;
    
    interval

    constructor(private _streamService: StreamService,
                private _authService:AuthService,
                private _timelineService:TimelineService) {

        this._streamService.posts.subscribe(posts => {
            this.posts = posts;
        });
        
    }

    ngOnInit() {
        if(this._authService.isAuthenticated()){

            this._streamService.load()
            // this.interval = setInterval(() => this._streamService.load(), 10000 );
        }
    }

    ngOnDestroy() {
        clearInterval(this.interval);
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

    onScroll(event) {

        let offsetHeight = document.documentElement.offsetHeight;
        let scrollY =  window.scrollY;
        let innerHeight = window.innerHeight;

        if (scrollY + innerHeight == offsetHeight) {
            console.log('At the bottom');
        }
    }

}