import {Component} from 'angular2/core';

import {RouteParams,RouteData} from 'angular2/router';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FriendsService} from "./friendsService";


@Component({
    selector: 'Friends',
    templateUrl: './app/friends/friends.html',
    providers:[FriendsService]
})

export class Friends {

    auth:string;
    myfriends:Friend[];
    unconfirmedFriends:Friend[];
    searchedFriends:Friend[];

    constructor(private _routeParams:RouteParams,
                private _friendsService: FriendsService) {
        this.auth = localStorage.getItem('AuthKey');

    }

    ngOnInit() {
        if(this.auth){
            this.loadMyFriends();
            //this.loadUnconfirmedFriends();
            //this.findNewFriend("r");
            //this.confirmFriendship("56abda583e8aeae701b4f25b");
            //this.confirmFriendship("56abe2bd1ee9a7f103f4bb29");
        }
    }

    private loadMyFriends():void {
        if(this.auth){
            this._friendsService.loadMyFriends()
                .subscribe(
                    res => {
                        console.log(res);
                    },
                    error => {console.log(error.message);}
                );
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
                    response => {
                        //this.loadMyFriends();
                        //this.loadUnconfirmedFriends();
                        //this.loadSuggestedFriendship();
                        console.log(response);
                    },
                    error => { console.log(error.message);}
                )
        }
    }
}

class Friend{

}