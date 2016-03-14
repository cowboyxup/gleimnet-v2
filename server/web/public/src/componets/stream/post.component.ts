import {ChangeDetectionStrategy} from "angular2/core";
import {Input} from "angular2/core";
import {Component} from "angular2/core";
import {Post} from "../../services/timeline.service";
import {TimelineService} from "../../services/timeline.service";


@Component({
    selector: 'posting',
    template: `

        <div class="mdl-card mdl-shadow--4dp mdl-cell mdl-cell--12-col">
            <div class="mdl-color-text--grey-700 posting_header meta">
                <img src="img/profilimages/64x64/{{posting.author}}.png" class="round_avatar">
                <div class="comment__author">
                    <strong>{{posting.author}}</strong>
                    <span>2 days ago</span>
                </div>
            </div>

                <div class="posting_contet">
                    {{posting.content}}
                </div>

            <div class="posting_contet comments">
               <form>
                    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <input #newPosting
                            (keyup.enter)="commentOnPosting(newPosting.value, posting._id); newPosting.value=''"
                            type="text" class="mdl-textfield__input">
                        <label for="comment" class="mdl-textfield__label">
                            Was ist Ihre Meinung dazu?
                        </label>
                    </div>
                    <button class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon"
                            (click)="commentOnPosting(newPosting.value, posting._id); newPosting.value=''">
                        <i class="material-icons" role="presentation">check</i><span class="visuallyhidden">add comment</span>
                    </button>
                </form>
                <div class="comment mdl-color-text--grey-700" *ngFor="#Comment of posting.comments">
                    <header class="comment__header">
                        <img src="img/profilimages/64x64/{{Comment.author}}.png" class="round_avatar">
                        <div class="comment__author">
                            <strong>{{Comment.author}}</strong>
                            <span>2 days ago</span>
                        </div>
                    </header>
                    <div class="comment__text">
                        {{Comment.content}}
                    </div>
                </div>
              </div>
            </div>`
    ,
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class TimeLinePostComponent {
    @Input() posting: Post;

    constructor(private _timelineService: TimelineService) { }


    commentOnPosting(content:string, postId:string){
        let username = localStorage.getItem('username');
        if(username){
            this._timelineService.commentOnPosting(content, postId);
        }
    }
}