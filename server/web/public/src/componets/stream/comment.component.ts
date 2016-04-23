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
                <a href="#/profile/{{author}}">
                    <img src="{{authorAvatar}}" class="round_avatar48">
                </a>
                <div class="comment__author">
                    <a href="#/profile/{{author}}">
                        <strong>{{authorName}}</strong>
                    </a>
                    <span>{{timeCreated | fromNow}}</span>
                </div>
            </header>
            <div class="comment__text">
                <p class="flow-text">
                    {{content}}
                </p>
                
            </div>
        </div>     
    `
    ,
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class CommentComponent {
    @Input() comment: Comment;

    author:         string;
    authorAvatar:   string;
    authorName:     string;
    timeCreated:    string;
    content:        string;

    constructor(private _profileService: ProfileService) {
    }

    ngOnInit() {
        if ( this.comment !== null ) {

            this.timeCreated = this.comment.timeCreated;
            this.content     = this.comment.content;

            this._profileService.getUserForId(this.comment.author).subscribe( user => {
                if (user !== null) {
                    this.authorName = user.givenName;
                    this.authorAvatar = user.avatar;
                }
            });
        }
    }
}
