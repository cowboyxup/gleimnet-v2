import {ChangeDetectionStrategy} from "angular2/core";
import {Input} from "angular2/core";
import {Component} from "angular2/core";
import {TimelineService} from "../../services/timeline.service";
import {Post, indexOfId, IdInterface} from "../../models";
import {FromNowPipe} from "../../util/FromNowPipe";
import {ProfileService} from "../../services/profile.service";
import {CommentComponent} from "./comment.component";
import {AuthService} from "../../admin/services/auth.service";
import {SortByPropertyAscendingPipe} from "../../util/sort-by-property-ascending.pipe";
import {UserListItemComponent} from  "../friends/userListItem.component";

@Component({
    selector: 'posting',
    pipes: [
        FromNowPipe,
        SortByPropertyAscendingPipe
    ],
    directives: [
        CommentComponent,
        UserListItemComponent
    ],
    template: `
        <div class="card">
            <div class="mdl-color-text--grey-700 posting_header meta">
                <a href="#/profile/{{author}}">
                    <img src="{{authorAvatar}}" class="round_avatar48">
                </a>
                <div class="comment__author" >
                
                    <span class="author">
                        <a href="#/profile/{{author}}">
                            <strong>{{authorName}}</strong>
                        </a>
                        <span>{{timeCreated | fromNow}}</span>
                    </span>
                </div>
            </div>

                <div class="posting_contet">
                    <p class="flow-text">
                        {{content}}
                    </p>
                </div>
                <span class="like">
                    Likes:
                     
                     <div *ngFor="#userId of likes" class="" style="display: inline">
                        <userListItem [userId]="userId"></userListItem>    
                     </div>
                     
                    {{likes.length}}
                    <a *ngIf="likedByMe" (click)="removelike()"><i class="material-icons">favorite</i></a> 
                    <a *ngIf="!likedByMe" (click)="like()"><i class="material-icons">favorite_border</i></a> 
                </span>
                
            <div class="posting_contet comments">
               
                <div class="comment" *ngFor="#comment of posting.comments | sortAscendingByProperty : 'timeCreated'">
                     <comment [comment]="comment"></comment>
                </div>

                <form>
                    <div class="input-field col s10">
                        <input #newPosting
                            (keyup.enter)="commentOnPosting(newPosting.value); newPosting.value=''"
                            type="text" class="mdl-textfield__input">
                        <label for="comment">
                            Was ist Ihre Meinung dazu?
                        </label>
                    </div>
                        <button class="waves-effect waves-light btn"
                            (click)="commentOnPosting(newPosting.value); newPosting.value=''">
                                <i class="large material-icons">send</i>
                    </button>
                </form>
            </div>
        </div>`
    ,
    // changeDetection: ChangeDetectionStrategy.OnPush
})


export class TimeLinePostComponent {
    @Input() posting: Post;

    id: string;
    author: string;
    authorAvatar: string;
    authorName: string;

    timeCreated: string;
    content: string;
    likes: IdInterface[] = [];

    // comments: Comment[] = []

    likedByMe: boolean = false;

    constructor(private _timelineService: TimelineService,
                private _profileService: ProfileService) {
    }

    ngOnInit() {

        let index = indexOfId(this.posting.likes, localStorage.getItem('userId'));

        this.likedByMe = index !== -1;

        if (this.posting !== null) {

            this.id          = this.posting._id;
            this.timeCreated = this.posting.timeCreated;
            this.content     = this.posting.content;
            this.likes       = this.posting.likes;

            this._profileService.getUserForId(this.posting.author).subscribe( user => {
                if (user !== null) {
                    this.author = user._id;
                    this.authorName = user.nickname;
                    this.authorAvatar = user.avatar;
                }
            });

            // this.posting.comments.forEach(comment => {
            //     if ( comment !== null ) {
            //         this._profileService.getUserForId(comment.author).subscribe( user => {
            //             if (user !== null) {
            //                 comment.authorName = user.givenName;
            //                 comment.authorAvatar = user.avatar;
            //             }
            //         });
            //     }
            // });
        }

    }

    like() {
        this._timelineService.likePost(this.posting._id);
        this.likedByMe = true;
    }

    removelike() {
        this._timelineService.likePost(this.posting._id);
    }

    commentOnPosting(content: string) {

        this._timelineService.commentOnPosting(content, this.posting._id);
    }
}
