import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";
import {Control} from "angular2/common";
import {OnDestroy} from "angular2/core";

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import {Post} from "../../services/timeline.service";
import {TimeLinePostComponent} from "./post.component";
import {ProtectedDirective} from "../../directives/protected.directive";
import {StreamService} from "../../services/stream.service";
import {AuthService} from "../../services/auth.service";


@Component({
    selector: 'Stream',
    providers:[StreamService],
    directives: [
        TimeLinePostComponent,
        ProtectedDirective
    ],

    template: `
    <div protected>

     <div  class="mdl-card mdl-shadow--4dp mdl-cell mdl-cell--12-col stream_form">
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
                <i class="material-icons" role="presentation">check</i><span class="visuallyhidden">add comment</span>
            </button>
        </form>
     </div>

    <div class="posting" *ngFor="#posting of myArray ">
        <posting [posting]="posting"> </posting>
    </div>
    </div>
`

})



export class Stream implements OnInit,OnDestroy{

    private myArray: Array<Post> = new Array<Post>();
    interval

    constructor(private _streamService: StreamService,
                private _authService:AuthService) {

    }

    ngOnInit() {
        if(this._authService.isAuthenticated()){

            //this._streamService._postDictionary._values$.subscribe(latestCollection => {
            //    this.myArray = latestCollection;
            //});

            this._streamService.load()
            this.interval = setInterval(() => this._streamService.load(), 10000 );
        }
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    postNewPosting(content:string){
        if(this._authService.isAuthenticated()){
            console.log(content);
            this._streamService.postNewPosting(this._authService.getUserId(), content);
        }
    }

    commentOnPosting(content:string, postId:string){
        if(this._authService.isAuthenticated()){
            this._streamService.commentOnPosting(content, postId);

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