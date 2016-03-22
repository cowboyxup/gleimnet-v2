import {ChangeDetectionStrategy} from "angular2/core";
import {Input} from "angular2/core";
import {Component} from "angular2/core";
import {TimelineService} from "../../services/timeline.service";
import {Post} from "../../models";
import {FromNowPipe} from "../../util/FromNowPipe";


@Component({
    selector: 'posting',
    pipes: [
        FromNowPipe
    ],
    template: `

        <div class="card">
            <div class="mdl-color-text--grey-700 posting_header meta">
                <img src="img/profilimages/64x64/{{posting.authorName}}.png" class="round_avatar">
                <div class="comment__author">
                    <strong>{{posting.author}}</strong>
                    <span>{{posting.timeCreated | fromNow}}</span>
                </div>
            </div>

                <div class="posting_contet">
                    {{posting.content}}
                </div>

            <div class="posting_contet comments">
               
               <form>
                    <div class="input-field col s10">
                        <input #newPosting
                            (keyup.enter)="commentOnPosting(newPosting.value, posting._id); newPosting.value=''"
                            type="text" class="mdl-textfield__input">
                        <label for="comment">
                            Was ist Ihre Meinung dazu?
                        </label>
                    </div>
                        <button class="waves-effect waves-light btn send_Button"
                            (click)="commentOnPosting(newPosting.value, posting._id); newPosting.value=''">
                                <i class="large material-icons">send</i>
                    </button>
                </form>
                
                <div class="comment mdl-color-text--grey-700" *ngFor="#comment of posting.comments">
                    <header class="comment__header">
                        <img src="img/profilimages/64x64/{{comment.author}}.png" class="round_avatar">
                        <div class="comment__author">
                            <strong>{{comment.author}}</strong>
                            <span>{{comment.timeCreated | fromNow}}</span>
                        </div>
                    </header>
                    <div class="comment__text">
                        {{comment.content}}
                    </div>
                </div>
              </div>
            </div>`
    ,
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class TimeLinePostComponent {
    @Input() posting: Post;

    constructor(private _timelineService: TimelineService) {}


    commentOnPosting(content:string, postId:string){
        console.log(content);

        this._timelineService.commentOnPosting(content, postId);

    }
}