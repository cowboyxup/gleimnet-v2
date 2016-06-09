import {Component, ChangeDetectionStrategy, Input, OnInit, OnChanges} from "angular2/core";
import {User, indexOfId} from "../../models";
import {FriendsService} from "../../services/friends.service";
import {AuthService} from "../../services/auth.service";
import {ProfileService} from "../../services/profile.service";


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
                        
                        <a *ngIf="!isFriend && !sendRequest" (click)="addFriend(user._id)">Freundschaftsanfrage versenden</a>
                        <a *ngIf="sendRequest" >Freundschaftsanfrage versendet</a>

                        <a *ngIf="isFriend" >befreundet</a>
                    </div>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class FriendAddListItemComponent implements OnChanges {

    @Input() user: User;

    isFriend: boolean = false;
    sendRequest: boolean = false;

    constructor(private _friendsService: FriendsService,
                private _authService: AuthService) {
    }


    ngOnChanges(changes: {}): any {

        if (this.user !== null && this.user !== undefined) {
            if (this.user.friends !== null ) {
                let index = indexOfId(this.user.friends, this._authService.getUserId());

                console.log(this.user.nickname + "  " + index);
                if ( index !== -1 ) {
                    this.isFriend = true;
                }
            }
        }

        return undefined;
    }



    private addFriend(userId: string) {
        if (this._authService.isAuthenticated()) {
            this._friendsService.requestFriendship(userId);
            this.sendRequest = true;
            //this._friendsService.redoSearch();
        }
    }
}
