import {Component, ChangeDetectionStrategy, Input} from "angular2/core";
import {User} from "../../models";
import {FriendsService} from "../../services/friends.service";
import {AuthService} from "../../services/auth.service";


@Component({
    selector: 'friendAddListItem',
    template: `
        <div class="row valign-wrapper">
            <div class="col s2">
                <a href="#/profile/{{user._id}}">
                    <img src="{{user.avatar}}" alt="" class="circle responsive-img">
                </a>
            </div>
            <div class="col s10">
                <div >
                    <a href="#/profile/{{user._id}}">
                        <h5>{{user.givenName}}      {{user.surname}}</h5>
                    </a>
                    
                    <div class="">
                        <p>{{user.description}}</p>
                    
                        <a (click)="addFriend(user._id)">Freundschaftsanfrage versenden</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class FriendAddListItemComponent {
    @Input() user: User;

    constructor(private _friendsService: FriendsService,
                private _authService: AuthService) { }


    private addFriend(userId: string) {
        if (this._authService.isAuthenticated()) {
            this._friendsService.requestFriendship(userId);
        }
    }
}
