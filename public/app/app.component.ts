import {Component, OnInit} from 'angular2/core';
import {Friend} from './friend';
import {FriendDetailComponent} from './friend-detail.component';
import {FriendService} from './friend.service';

@Component({
    selector: 'my-app',
    template:`
    <h1>{{title}}</h1>
    <h2>My Friends</h2>
    <ul class="friends">
      <li *ngFor="#friend of friends"
        [class.selected]="friend === selectedFriend"
        (click)="onSelect(friend)">
        <span class="badge">{{friend.id}}</span> {{friend.name}}
      </li>
    </ul>
    <my-friend-detail [friend]="selectedFriend"></my-friend-detail>
  `,
    styles:[`
    .selected {
      background-color: #CFD8DC !important;
      color: white;
    }
    .friends {
      margin: 0 0 2em 0;
      list-style-type: none;
      padding: 0;
      width: 10em;
    }
    .friends li {
      cursor: pointer;
      position: relative;
      left: 0;
      background-color: #EEE;
      margin: .5em;
      padding: .3em 0em;
      height: 1.6em;
      border-radius: 4px;
    }
    .friends li.selected:hover {
      color: white;
    }
    .friends li:hover {
      color: #607D8B;
      background-color: #EEE;
      left: .1em;
    }
    .friends .text {
      position: relative;
      top: -3px;
    }
    .friends .badge {
      display: inline-block;
      font-size: small;
      color: white;
      padding: 0.8em 0.7em 0em 0.7em;
      background-color: #607D8B;
      line-height: 1em;
      position: relative;
      left: -1px;
      top: -4px;
      height: 1.8em;
      margin-right: .8em;
      border-radius: 4px 0px 0px 4px;
    }
  `],
    directives: [FriendDetailComponent],
    providers: [FriendService]
})

export class AppComponent implements OnInit {
    public title = 'all your friends';
    public friends: Friend[];
    public selectedFriend: Friend;
    constructor(private _friendService: FriendService) { }

    getFriends() {
        this._friendService.getFriends().then(friends => this.friends = friends);
    }

    ngOnInit() {
        this.getFriends();
    }

    onSelect(friend: Friend) {
        console.log("ff");
        this.selectedFriend = friend;
        this._friendService.getFriendsSlowly().then(friends => this.friends = friends)
    }
}