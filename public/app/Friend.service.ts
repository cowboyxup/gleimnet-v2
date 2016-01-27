import {Friend} from './friend';
import {Injectable} from 'angular2/core';
import {FRIENDS} from "./mock-friends";
@Injectable()

export class FriendService {
    getFriends() {
        return Promise.resolve(FRIENDS);
    }

    getFriendsSlowly() {
        return new Promise<Friend[]>(resolve =>
            setTimeout(()=>resolve(FRIENDS), 2000) // 2 seconds
        );
    }
}