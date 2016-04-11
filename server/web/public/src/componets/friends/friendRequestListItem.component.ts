import {Component, ChangeDetectionStrategy, Input, OnInit} from "angular2/core";
import {User, IdInterface} from "../../models";
import {FriendsService} from "../../services/friends.service";
import {AuthService} from "../../services/auth.service";
import {ProfileService} from "../../services/profile.service";


@Component({
    selector: 'friendRequestListItem',
    template: `
        <div class="row valign-wrapper">
            <div class="col s2">
                <a href="#/profile/{{userId._id}}">
                    <img src="{{avatar}}" alt="" class="circle responsive-img">
                </a>
            </div>
            <div class="col s10">
                <div >
                    <a href="#/profile/{{userId._id}}">
                        {{givenName}}
                    </a>
                    
                    <div class="">
                        <p>{{description}}</p>
                    
                        <a (click)="addFriend(userId._id)">Freundschaftsanfrage bestätigen</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class FriendRequestListItemComponent implements OnInit {
    @Input() userId: IdInterface;

    avatar:string;
    givenName:string
    description:string;

    constructor(private _friendsService: FriendsService,
                private _authService: AuthService,
                private _profileService: ProfileService) {}


    ngOnInit() {
        this._profileService.getUserForId(this.userId._id).subscribe( user => {

            if (user !== null) {
                this.avatar = user.avatar;
                this.givenName = user.givenName;
                this.description = user.description;
            }
        });
    }

    private addFriend(userId: string) {
        if (this._authService.isAuthenticated()) {
            this._friendsService.requestFriendship(userId);
        }
    }
}
