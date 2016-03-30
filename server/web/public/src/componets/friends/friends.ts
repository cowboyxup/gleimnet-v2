import {FriendsService} from "../../services/friends.service";
import {ProfileService} from "../../services/profile.service";
import {Component} from "angular2/core";
import {ProtectedDirective} from "../../directives/protected.directive";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models";
import {FriendListItemComponent} from "./friendListItem.component";
import {FriendAddListItemComponent} from "./friendAddListItem.component";


@Component({
    selector: 'Friends',
    directives: [
        ProtectedDirective,
        FriendListItemComponent,
        FriendAddListItemComponent
    ],
    template: `
        <div protected class="row">
            <div class="col s3">
                <div class="card">
                    <div class="card-content">
                        <h4>Freunde:</h4>
                        
                        <div *ngFor="#user of friends" class="row">
                            <friendListItem [user]="user"></friendListItem>    
                        </div>
                        
                    </div>
                </div>
            </div>
            <div class="col s9">
                <div class="card">
                    <div class="card-content">
                        <div *ngIf="unconfirmedFriends">
                            <h4>Freundschaftsanfragen:</h4>
                            <div class="media post" *ngFor="#Friendship of unconfirmedFriends">
                                <div class="media-left">
                                    <a href="#/profile/{Friendship.user.username}}">
                                        <img class="media-object timelineImage" alt="" 
                                            src="img/profilimages/64x64/{{Friendship.user.avatar}}.png">
                                    </a>
                                </div>
                                <div class="media-body">
                                    <h4 class="media-heading">
                                        {{Friendship.user.givenName}} {{Friendship.user.surename}}
                                    </h4>
                                    <p>
                                        {{Friendship.user.description}}
                                    </p>
                                    <a (click)="confirmFriendship(Friendship._id)">als Freund hinzufügen</a>
                                </div>
                            </div>
                            <hr>
                        </div>
                        
                      
                        
                        <h4>Freunde suchen:</h4>
                        
                            <form class="row">
                                <span class="input-field col s10">
                                    <input #friendname
                                           (keyup.enter)="findNewFriend(friendname.value); friendname.value=''"
                                           type="text" class="form-control">
                                    <label for="comment">
                                        Name des Freundes
                                    </label>
                                </span>
                                <span class="input-group-btn col s1">
                                    <button class="waves-effect waves-light btn send_Button"
                                        (click)="findNewFriend(friendname.value); friendname.value=''">
                                        <i class="large material-icons">search</i>
                                    </button>
                                </span>
                            </form>
                            
                            <div *ngFor="#user of searchedFriends" class="row">
                                <friendAddListItem [user]="user"></friendAddListItem>    
                            </div>

                        </div>
                    <div>
                </div>
            </div>
        </div>
        `,
    providers: []
})

export class Friends {

    friends: Array<User>;
    unconfirmedFriends: Array<User>;
    searchedFriends: Array<User>;

    constructor(private _friendsService: FriendsService,
                private _authService: AuthService) {

        this._friendsService.searchedFriends.subscribe((users: Array<User>) => {
            this.searchedFriends = users;
        });

        this._friendsService.unconfirmedFriends.subscribe((users: Array<User>) => {
            this.unconfirmedFriends = users;
        });

        this._friendsService.friends.subscribe((users: Array<User>) => {
            this.friends = users;
        });
    }

    ngOnInit() {
        if (this._authService.isAuthenticated()) {
           this.loadMyFriends();
           this.loadUnconfirmedFriends();
       }
    }

    private findNewFriend(friendName: string) {
        if (this._authService.isAuthenticated()) {
            this._friendsService.findNewFriend(friendName);
        }
    }

    private requestFriendship(userId: string) {
        if (this._authService.isAuthenticated()) {
            this._friendsService.requestFriendship(userId);
        }
    }

    private loadMyFriends(): void {
        if (this._authService.isAuthenticated()) {
            this._friendsService.loadFriends();
       }
    }

    private loadUnconfirmedFriends(): void {
       if (this._authService.isAuthenticated()) {
           this._friendsService.loadUnconfirmedFriends();
       }
    }

    private removeFriend(userId: string) {
        if (this._authService.isAuthenticated()) {
            this._friendsService.removeFriend(userId);
        }
    }
}
