import {Component} from 'angular2/core';

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FriendsService} from "./friendsService";
import {ProfileService} from "../home/profile.service";
import {User} from "../home/profile.service";
import {SearchResult} from "./friendsService";


@Component({
    selector: 'Friends',
    templateUrl: './app/friends/friends.html',
    providers:[FriendsService, ProfileService]
})

export class Friends {

    auth:string;
    private username;

    myfriends:Friend[];
    unconfirmedFriends:Friend[];
    searchedFriends:User[];

    constructor(private _routeParams:RouteParams,
                private _friendsService: FriendsService,
                private _profileService: ProfileService) {
        this.auth = localStorage.getItem('AuthKey');
        this.username = localStorage.getItem('username');
    }

    ngOnInit() {
        if(this.auth){
            this.loadMyFriends();
            this.loadUnconfirmedFriends();
        }
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
            this._friendsService.loadUnconfirmedFriends()
                .subscribe(
                    res => {
                        console.log(res);
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

    private loadSuggestedFriendship(username:string){

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