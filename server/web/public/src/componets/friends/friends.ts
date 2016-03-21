import {FriendsService} from "../../services/friendsService";
import {ProfileService} from "../../services/profile.service";
import {Friendship} from "../../services/friendsService";
import {Component} from "angular2/core";
import {ProtectedDirective} from "../../directives/protected.directive";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models";

@Component({
    selector: 'Friends',
    directives: [
        ProtectedDirective
    ],

    template: `
<div protected class="row">
    <div class="col s3">
        <div class="card">
            <div class="card-content">
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
        </div>
    </div>
    <div class="col s9">
        <div class="card">
            <div class="card-content">
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
                    
                    
                    <div class="card" *ngFor="#user of searchedFriends">
                        <div class="card-content">
    
                            <span class="card-title activator grey-text text-darken-4">
                                <a>
                                

                                    <img class="round_avatar48 " alt="" src="assets/{{user.avatar}}">
                                    {{user.givenName}}
                                </a>
                            </span>
      
                            <div class="">
                                <p>{{user.description}}</p>
                                <a (click)="requestFriendship(user._id)">als Freund hinzufügen</a>
                            </div>
    
                        </div>
                    </div>
                </div>
            <div>
        </div>
    </div>
</div>`,
    providers:[FriendsService, ProfileService]
})

export class Friends {

    myfriends:Friend[];
    unconfirmedFriends:Friendship[] = [];

    searchedFriends:Array<User>;

    constructor(private _friendsService: FriendsService,
                private _authService:AuthService) {

        this._friendsService.searchedFriends.subscribe((users:Array<User>)=>{
            this.searchedFriends=users;
        });
        
    }

    ngOnInit() {
       if(this._authService.isAuthenticated()){
           this.loadMyFriends();
           //this.loadUnconfirmedFriends();
       }
    }

    private findNewFriend(friendName:string){
        if(this._authService.isAuthenticated()){
            this._friendsService.findNewFriend(friendName);
        }
    }

    private requestFriendship(userId:string){
        if(this._authService.isAuthenticated()){
            this._friendsService.requestFriendship(userId);
        }
    }
    
    private loadMyFriends():void {
        if(this._authService.isAuthenticated()){
           // this._friendsService.loadProfilInfos(this.username)
           //     .subscribe(
           //         (res:User) => {
           //             this.myfriends = res.friends;
           //         },
           //         error => {console.log(error.message);}
           //     )
       }
    }

    //private loadUnconfirmedFriends():void {
    //    if(this.auth){
    //
    //        this.unconfirmedFriends = [];
    //
    //        this._friendsService.loadUnconfirmedFriends()
    //            .subscribe(
    //                (res: Friendship[]) => {
    //
    //                    res.forEach(friendship =>{
    //                        friendship.friends.forEach(friend =>{
    //                           if(friend.id != this.userid){
    //                               friendship.userid = friend.id;
    //
    //                               this._profileService.loadProfilInfosWithID(friend.id)
    //                                   .subscribe(
    //                                       (res:User) => {
    //                                           friendship.user = res;
    //                                           this.unconfirmedFriends.push(friendship);
    //                                       },
    //                                       error => {console.log(error.message);}
    //                                   )
    //
    //                           }
    //                        })
    //                    });
    //                    console.log(this.unconfirmedFriends);
    //
    //
    //                },
    //                error => {console.log(error.message);}
    //            );
    //    }
    //}

    // private confirmFriendship(friendshipId:string){
    //    if(this.auth) {
    //        this._friendsService.confirmFriendship(friendshipId)
    //            .subscribe(
    //                response => {
    //                    this.loadMyFriends();
    //                    this.loadUnconfirmedFriends();
    //                },
    //                error => { console.log(error.message);}
    //            )
    //    }
    // }
    //


    private loadSuggestedFriendship(){

    }

    


    public removeFriend(){

    }
}

class Friend{

}