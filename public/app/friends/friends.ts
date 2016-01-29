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
            this.loadUnconfirmedFriends();
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

    }

    private confirmFriendship(friendshipId:string){

    }

    private requestFriendship(username:string){

    }

    private suggestedFriendship(username:string){

    }

    private findNewFriend(friendName:string){

    }
}

class Friend{

}