import {Component, ChangeDetectionStrategy, Input, OnInit} from "angular2/core";
import {User, IdInterface} from "../../models";
import {FriendsService} from "../../services/friends.service";
import {AuthService} from "../../services/auth.service";
import {ProfileService} from "../../services/profile.service";


@Component({
    selector: 'userListItem',
    template: `

        <span class="chip">
            <a href="#/profile/{{userId._id}}">
                <img src="{{avatar}}" alt="">
                {{givenName}} {{surname}}
            </a>
        </span>
      
    `,
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserListItemComponent implements OnInit {
    @Input() userId: IdInterface;

    avatar: string;
    givenName: string;
    description: string;
    surname: string;

    constructor(private _friendsService: FriendsService,
                private _authService: AuthService,
                private _profileService: ProfileService) {}


    ngOnInit() {
        this._profileService.getUserForId(this.userId._id).subscribe( user => {

            if (user !== null) {
                this.avatar = user.avatar;
                this.givenName = user.givenName;
                this.description = user.description;
                this.surname = user.surname;
            }
        });
    }

    private addFriend(userId: string) {
        if (this._authService.isAuthenticated()) {
            this._friendsService.requestFriendship(userId);
        }
    }
}
