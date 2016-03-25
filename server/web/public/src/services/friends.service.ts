import {Injectable} from 'angular2/core';
import {Subject } from 'rxjs/Subject';
import {headers} from "./common";
import {Response} from "angular2/http";
import {Paged, User} from "../models";
import {AuthHttp} from "../common/angular2-jwt";


@Injectable()
export class FriendsService {

    baseUrl: string = "api/v1/friends";
    searchedFriends: Subject<Array<User>> = new Subject<Array<User>>();
    unconfirmedFriends: Subject<Array<User>> = new Subject<Array<User>>();
    friends: Subject<Array<User>> = new Subject<Array<User>>();

    constructor(private _http: AuthHttp) {}


    findNewFriend(name: string) {
        if (name !== "") {
            this._http.get(this.baseUrl + "?search=" + name, {headers: headers()})
                .map((res: Response) => res.json())
                .subscribe(
                    (res: Paged<User>) => {
                        // console.log(res);
                        this.searchedFriends.next(res.data);
                    });
        }
    }

    loadUnconfirmedFriends() {
        this._http.get(this.baseUrl + "/unconfirmed", {headers: headers()})
            .map((res: Response) => res.json())
            .subscribe(
                (res: Paged<User>) => {
                    // console.log(res);
                    this.unconfirmedFriends.next(res.data);
                });
    }

    loadFriends() {
        this._http.get(this.baseUrl, {headers: headers()})
            .map((res: Response) => res.json())
            .subscribe(
                (res: Paged<User>) => {
                    // console.log(res);
                    this.friends.next(res.data);
                });
    }

    requestFriendship(id: string) {
        this._http.post(this.baseUrl + "/" + id, "{}", {headers: headers()})
            .map((res: Response) => res.json())
            .subscribe(
                (res) => {
                    console.log(res);
                    this.loadFriends();
                    this.loadUnconfirmedFriends();
                },
                error => {
                    console.log("fehler");
                }
            );
    }

    removeFriend(userId: string) {
        this._http.delete(this.baseUrl + "/" + userId, {headers: headers()})
            .map((res: Response) => res.json())
            .subscribe(
                (res) => {
                    console.log(res);
                    this.loadFriends();
                    this.loadUnconfirmedFriends();
                },
                error => {
                    console.log("fehler");
                });
    }
}

