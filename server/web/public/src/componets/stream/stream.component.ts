import {Component} from 'angular2/core';
import {OnInit} from "angular2/core";
import {Control} from "angular2/common";
import {OnDestroy} from "angular2/core";

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import {autKey} from "../../common/consts";
import {Post} from "../../services/timeline.service";
import {TimelineService} from "../../services/timeline.service";
import {TimeLinePostComponent} from "./post.component";
import {ProtectedDirective} from "../../directives/protected.directive";


@Component({
    selector: 'Stream',
    providers:[TimelineService],
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
    username:string;

    constructor(private _timelineService: TimelineService) { }

    ngOnInit() {
        var basicAuth =  localStorage.getItem('AuthKey');
        if(basicAuth){

            this.username = localStorage.getItem('username');

            this._timelineService._postDictionary._values$.subscribe(latestCollection => {
                this.myArray = latestCollection;
            });

            this._timelineService.load(this.username)
            this.interval = setInterval(() => this._timelineService.load(this.username), 2000 );
        }
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    postNewPosting(content:string){
        if(this.username){
            console.log(content);
            this._timelineService.postNewPosting(this.username, content);
        }
    }

    commentOnPosting(content:string, postId:string){
        if(this.username){
            this._timelineService.commentOnPosting(content, postId);

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