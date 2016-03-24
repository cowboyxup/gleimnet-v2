import {Injectable} from "angular2/core";
import {User} from "../models";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import {Response} from "angular2/http";
import {headers} from "./common";
import {indexOf} from "../common/arrays";
import {BehaviorSubject} from "rxjs/Rx";
import {Subject} from "rxjs/Subject";

@Injectable()
export class UserService {
    baseUrl = 'api/v1/profile/'

    private _userArray:Array<User> = new Array<User>();

    constructor(public _http: AuthHttp) {}


    getUserForId(id:string):Subject<User> {

        var currentUser:Subject<User> = new BehaviorSubject<User>(null);

        console.log(id);

        var user = new User("");
        user._id = id;

        let index:number = indexOf(this._userArray, user, (u:User, user) => {
            return u._id == user._id;
        })

        if (index != -1) {
            currentUser.next(this._userArray[index]);
            currentUser.complete();
        } else {
            let http = this._http;
            let baseUrl = this.baseUrl;

            http.get(baseUrl + id, {headers: headers()})
                .map((res:Response) => {
                    return res.json();
                })
                .subscribe(
                    (res:User) => {
                        console.log(res);
                        this._userArray.push(res);
                        currentUser.next(res);
                        currentUser.complete();
                    },
                    error => {
                        console.log(error);
                        currentUser.complete();
                    }
                );
        }

        return currentUser;
    }

}