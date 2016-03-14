import {Component} from 'angular2/core';

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FriendsService} from "../services/friendsService";
import {ProfileService} from "../services/profile.service";
import {User} from "../services/profile.service";
import {Friendship} from "../services/friendsService";
import {SearchResult} from "../services/friendsService";



@Component({
    selector: 'Friends',
    templateUrl: './app/friends/friends.html',
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