import {Component, ChangeDetectionStrategy, Input} from "angular2/core";
import {User, IdInterface} from "../../models";
import {FriendsService} from "../../services/friends.service";
import {AuthService} from "../../services/auth.service";
import {ProfileService} from "../../services/profile.service";


@Component({
    selector: 'friendListItem',
    template: `
        <div class="row valign-wrapper">
            <div class="col s4">
                <a href="#/profile/{{userId._id}}">
                    <img src="{{avatar}}" alt="" class="circle responsive-img">
                </a>
            </div>
            <div class="col s8">
                <div >
                    <a href="#/profile/{{userId._id}}">
                        <h5>{{givenName}} {{surname}}</h5>
                    </a>
                    <div>
                        <a (click)="removeFriend(userId._id)">Freundschaft beenden</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class FriendListItemComponent {
    @Input() userId: IdInterface;

    avatar: string;
    givenName: string;
    surname: string;
    description: string;

    constructor(private _friendsService: FriendsService,
                private _authService: AuthService,
                private _profileService: ProfileService) {}

    ngOnInit() {
        this._profileService.getUserForId(this.userId._id).subscribe( user => {

            if (user !== null) {
                this.avatar = user.avatar;
                this.givenName = user.givenName;
                this.surname = user.surname;
                this.description = user.description;
            }
        });
    }


    private removeFriend(userId: string) {
        if (this._authService.isAuthenticated()) {
            this._friendsService.removeFriend(userId);
        }
    }
}
