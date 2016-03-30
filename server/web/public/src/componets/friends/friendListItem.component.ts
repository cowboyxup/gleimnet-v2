import {Component, ChangeDetectionStrategy, Input} from "angular2/core";
import {User} from "../../models";
import {FriendsService} from "../../services/friends.service";
import {AuthService} from "../../services/auth.service";


@Component({
    selector: 'friendListItem',
    template: `
        <div class="row valign-wrapper">
            <div class="col s4">
                <a href="#/profile/{{user._id}}">
                    <img src="{{user.avatar}}" alt="" class="circle responsive-img">
                </a>
            </div>
            <div class="col s8">
                <div >
                    <a href="#/profile/{{user._id}}">
                        {{user.givenName}}
                    </a>
                    <div>
                        <a (click)="removeFriend(user._id)">Freundschaft beenden</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class FriendListItemComponent {
    @Input() user: User;

    constructor(private _friendsService: FriendsService,
                private _authService: AuthService) { }


    private removeFriend(userId: string) {
        if (this._authService.isAuthenticated()) {
            this._friendsService.removeFriend(userId);
        }
    }
}
