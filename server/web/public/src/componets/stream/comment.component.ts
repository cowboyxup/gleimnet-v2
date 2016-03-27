import {ChangeDetectionStrategy} from "angular2/core";
import {Input} from "angular2/core";
import {Component} from "angular2/core";
import {Comment} from "../../models";
import {FromNowPipe} from "../../util/FromNowPipe";
import {ProfileService} from "../../services/profile.service";


@Component({
    selector: 'comment',
    pipes: [
        FromNowPipe
    ],
    template: `
        <div class="comment mdl-color-text--grey-700">
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
    `
    ,
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class CommentComponent {
    @Input() comment: Comment;

    constructor(private _profileService: ProfileService) {
    }

    ngOnInit() {
        this._profileService.getUserForId(this.comment.author).subscribe( user => {
            if (user !== null) {
                this.comment.authorName = user.givenName;
                this.comment.authorAvatar = user.avatar;
            }
        });
    }
}
