import {Component} from 'angular2/core';
import {Friend} from './friend';


@Component({
    selector: 'my-friend-detail',
    template: `
    <div *ngIf="friend">
      <h2>{{friend.name}} details!</h2>
      <div><label>id: </label>{{friend.id}}</div>
      <div>
        <label>name: </label>
        <input [(ngModel)]="friend.name" placeholder="name"/>
      </div>

    </div>
  `,
    inputs: ['friend']
})
export class FriendDetailComponent {
    public friend: Friend;
}