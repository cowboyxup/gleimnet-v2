import {Injectable, bind} from 'angular2/core';
import {Subject, BehaviorSubject} from 'rxjs';
import {User} from "../models";

/**
 * UserService manages our current user
 */

@Injectable()
export class UserService {

    constructor() {
        console.log('UserService');
    }

    // `currentUser` contains the current user
    currentUser: Subject<User> = new BehaviorSubject<User>(null);
    //
    public setCurrentUser(newUser: User): void {
        this.currentUser.next(newUser);
    }
}

