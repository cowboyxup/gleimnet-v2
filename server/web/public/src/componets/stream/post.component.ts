import {ChangeDetectionStrategy} from "angular2/core";
import {Input} from "angular2/core";
import {Component} from "angular2/core";
import {TimelineService} from "../../services/timeline.service";
import {Post} from "../../models";
import {FromNowPipe} from "../../util/FromNowPipe";
import {UserService} from "../../services/user.service";
import {ProfileService} from "../../services/profile.service";


@Component({
    selector: 'posting',
    pipes: [
        FromNowPipe
    ],
    template: `
        <div class="card">
            <div class="mdl-color-text--grey-700 posting_header meta">
                <a href="#/profile/{{posting.author}}">
                    <img src="{{posting.authorAvatar}}" class="round_avatar48">
                </a>
                <div class="comment__author">
                    <a href="#/profile/{{posting.author}}">
                        <strong>{{posting.authorName}}</strong>
                    </a>
                    <span>{{posting.timeCreated | fromNow}}</span>
                </div>
            </div>

                <div class="posting_contet">
                    <p class="flow-text">
                        {{posting.content}}
                    </p>
                </div>

            <div class="posting_contet comments">
               
               <form>
                    <div class="input-field col s10">
                        <input #newPosting
                            (keyup.enter)="commentOnPosting(newPosting.value); newPosting.value=''"
                            type="text" class="mdl-textfield__input">
                        <label for="comment">
                            Was ist Ihre Meinung dazu?
                        </label>
                    </div>
                        <button class="waves-effect waves-light btn send_Button"
                            (click)="commentOnPosting(newPosting.value); newPosting.value=''">
                                <i class="large material-icons">send</i>
                    </button>
               </form>
                
               <div class="comment mdl-color-text--grey-700" *ngFor="#comment of posting.comments">
                    <header class="comment__header">
                        <a href="#/profile/{{comment.author}}">
                            <img src="{{comment.authorAvatar}}" class="round_avatar48">
                        </a>
                        <div class="comment__author">
                            <a href="#/profile/{{comment.author}}">
                                <strong>{{comment.authorName}}</strong>
                            </a>
                            <span>{{comment.timeCreated | fromNow}}</span>
                        </div>
                    </header>
                    <div class="comment__text">
                        <p class="flow-text">
                            {{comment.content}}
                        </p>
                        
                    </div>
                </div>
              </div>
            </div>`
    ,
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class TimeLinePostComponent {
    @Input() posting: Post;

    constructor(private _timelineService: TimelineService,
                private _profileService: ProfileService) {
    }

    ngOnInit() {
        this._profileService.getUserForId(this.posting.author).subscribe( user => {
            if (user !== null) {
                this.posting.authorName = user.givenName;
                this.posting.authorAvatar = user.avatar;
            }
        });

        this.posting.comments.forEach(comment => {
            this._profileService.getUserForId(comment.author).subscribe( user => {
                if (user !== null) {
                    comment.authorName = user.givenName;
                    comment.authorAvatar = user.avatar;
                }
            });
        });
    }

    commentOnPosting(content: string) {

        this._timelineService.commentOnPosting(content, this.posting._id);
    }
}
