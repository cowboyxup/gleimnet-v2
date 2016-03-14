

import {FriendsService} from "../../services/friendsService";
import {ProfileService} from "../../services/profile.service";
import {User} from "../../services/profile.service";
import {Friendship} from "../../services/friendsService";
import {SearchResult} from "../../services/friendsService";
import {Component} from "angular2/core";
import {RouteParams} from "angular2/router";
import {ProtectedDirective} from "../../directives/protected.directive";



@Component({
    selector: 'Friends',
    directives: [
        ProtectedDirective
    ],

    template: `
    <div protected>
<div class="container col-md-3">


    <h4>Freunde:</h4>
    <div class="media post" *ngFor="#Friend of myfriends">
        <div class="media-left">
            <a href="#/profile/{{Friend.username}}">
                <img class="media-object timelineImage" alt="" src="img/profilimages/64x64/{{Friend.username}}.png">
            </a>
        </div>
        <div class="media-body">
            <a href="#/profile/{{Friend.username}}">
                <h4 class="media-heading">{{Friend.surename}}</h4>
            </a>
            <a (click)="removeFriend(Friend)">Freundschaft beenden</a>
        </div>
    </div>

</div>


<div class="container col-md-9 timeline">

    <div >
        <!--<div *ngIf="unconfirmedFriends != null">-->

        <h4>Freundschaftsanfragen:</h4>

        <div class="media post" *ngFor="#Friendship of unconfirmedFriends">
            <div class="media-left">
                <a href="#/profile/{Friendship.user.username}}">
                    <img class="media-object timelineImage" alt="" src="img/profilimages/64x64/{{Friendship.user.avatar}}.png">
                </a>
            </div>
            <div class="media-body">
                <h4 class="media-heading">{{Friendship.user.givenName}} {{Friendship.user.surename}}</h4>
                <p>
                    {{Friendship.user.description}}
                </p>
                <a (click)="confirmFriendship(Friendship._id)">als Freund hinzufügen</a>
            </div>
        </div>

        <hr>
    </div>


    <h4>Freunde suchen:</h4>

    <div class="row">
        <div class="col-lg-6 timelineWriteSomeThing">
            <div class="input-group">
                <input #friendname
                       (keyup.enter)="findNewFriend(friendname.value); friendname.value=''"
                       type="text" class="form-control" placeholder="Name des Freundes">
                        <span class="input-group-btn">
                            <button (click)="findNewFriend(friendname.value); friendname.value=''"
                                    class="btn btn-default" type="button">post
                            </button>
                        </span>
            </div>
            <!-- /input-group -->
        </div>
        <!-- /.col-lg-6 -->
    </div>
    <!-- /.row -->


    <div class="media post" *ngFor="#Friend of searchedFriends">
        <div class="media-left">
            <a href="/profile/{{Friend.username}}">
                <img class="media-object timelineImage" alt="" src="img/profilimages/64x64/{{Friend.username}}.png">
            </a>
        </div>
        <div class="media-body">
            <a href="#/profile/{{Friend.username}}">
                <h4 class="media-heading">{{Friend.givenName}} {{Friend.surename}}</h4>
            </a>
            <p>{{Friend.description}}</p>
            <a (click)="confirmFriendship(Friend)">als Freund hinzufügen</a>
        </div>
    </div>
</div>
</div>
    `,
    providers:[FriendsService, ProfileService]
})

export class Friends {

    auth:string;
    private username;
    private userid:string;

    myUser:User;

    myfriends:Friend[];
    unconfirmedFriends:Friendship[] = [];
    searchedFriends:User[];

    constructor(private _routeParams:RouteParams,
                private _friendsService: FriendsService,
                private _profileService: ProfileService) {
        this.auth = localStorage.getItem('AuthKey');
        this.username = localStorage.getItem('username');
        this.userid = localStorage.getItem('id');
    }

    ngOnInit() {
        if(this.auth){
            this.loadMyFriends();
            this.loadUnconfirmedFriends();
        }
    }

    loadProfilInfos(userid:string){

            this._profileService.loadProfilInfosWithID(userid)
                .subscribe(
                    (res:User) => {
                        //this.user = res;
                        //this.user.dateString = this._profileService.getDateString(this.user.birthdate);
                        //this.friends = this.user.friends;
                    },
                    error => {console.log(error.message);}
                )

    }

    private loadMyFriends():void {
        if(this.username){
            this._profileService.loadProfilInfos(this.username)
                .subscribe(
                    (res:User) => {
                        this.myfriends = res.friends;
                    },
                    error => {console.log(error.message);}
                )
        }
    }

    private loadUnconfirmedFriends():void {
        if(this.auth){

            this.unconfirmedFriends = [];

            this._friendsService.loadUnconfirmedFriends()
                .subscribe(
                    (res: Friendship[]) => {

                        res.forEach(friendship =>{
                            friendship.friends.forEach(friend =>{
                               if(friend.id != this.userid){
                                   friendship.userid = friend.id;

                                   this._profileService.loadProfilInfosWithID(friend.id)
                                       .subscribe(
                                           (res:User) => {
                                               friendship.user = res;
                                               this.unconfirmedFriends.push(friendship);
                                           },
                                           error => {console.log(error.message);}
                                       )

                               }
                            })
                        });
                        console.log(this.unconfirmedFriends);


                    },
                    error => {console.log(error.message);}
                );
        }
    }

    private confirmFriendship(friendshipId:string){
        if(this.auth) {
            this._friendsService.confirmFriendship(friendshipId)
                .subscribe(
                    response => {
                        this.loadMyFriends();
                        this.loadUnconfirmedFriends();
                    },
                    error => { console.log(error.message);}
                )
        }
    }

    private requestFriendship(username:string){
        if(this.auth) {
            this._friendsService.requestFriendship(username)
                .subscribe(
                    response => {
                        this.loadMyFriends();
                        this.loadUnconfirmedFriends();
                        this.loadSuggestedFriendship();
                    },
                    error => { console.log(error.message);}
                )
        }
    }

    private loadSuggestedFriendship(){

    }

    private findNewFriend(friendName:string){
        if(this.auth) {
            this._friendsService.findNewFriend(friendName)
                .subscribe(
                    (response:SearchResult) => {
                        this.searchedFriends = response.data;
                    },
                    error => { console.log(error.message);
                    }
                )
        }
    }


    public removeFriend(){

    }
}

class Friend{

}