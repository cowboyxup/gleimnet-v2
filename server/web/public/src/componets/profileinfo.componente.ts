import {Component, Input, OnInit, ChangeDetectionStrategy, OnChanges} from "angular2/core";
import {User} from "../models";
import {ProfileService} from "../services/profile.service";
import {FormatedDateFromStringPipe} from "../util/dateFormat.pipe";
import {AuthService} from "../services/auth.service";

@Component({
    selector: 'profileInfo',
    pipes: [
        FormatedDateFromStringPipe
    ],
    template: `
        <div class="card profile_info">
            <div *ngIf="!editMode" class="card-content">
                <h4>Profil <a *ngIf="isMe" (click)="editProfile()"><i class="material-icons">mode_edit</i></a> </h4>
                
                <h5>Geburtsdatum:</h5>
                <p>{{birthdate | formatedDateFromString}}
                <h5>Beschreibung:</h5>
                <p>{{description}}</p>
                <h5>Wirkungsort:</h5>
                <p>{{influenceplace}}</p>
                <!--<h5>Geburtsort:</h5>-->
                <!--<p>{{birthplace}}</p>-->
                
                <h5>Tags:</h5>
                
                <div class="tags">
                 <span class="chip" *ngFor="#tag of tags">
                    {{tag}}
                 </span>
                </div>

                
            </div>
            <div *ngIf="editMode" class="card-content">
                <h4>Exposé 
                    <a (click)="cancel()"><i class="material-icons" style="margin-right: 20px;" >delete</i></a>
                    <a (click)="saveEdits()"><i class="material-icons">check</i></a>
                </h4>
                
                <h5>Geburtsdatum:</h5>
                <input [(ngModel)]="birthdate" type="date" max="1859-12-31" min="1698-01-01">
                
                <h5>Beschreibung:</h5>
                
                <textarea placeholder="Beschreibung" class="materialize-textarea" [(ngModel)]="description" ></textarea>
               
                <h5>Wirkungsort:</h5>
                
                <input placeholder="Wirkungsort" [(ngModel)]="influenceplace" type="text">
                
                <!--<h5>Geburtsort:</h5>-->
                <!---->
                <!--<input placeholder="Wirkungsort" [(ngModel)]="birthplace" type="text">-->
                
                <h5>Tags:</h5>
                
                 <div class="tags">
                 <span class="chip" *ngFor="#tag of tags">
                    {{tag}}
                    <a (click)="removeTag(tag)"><i class="material-icons">clear</i></a>
                 </span>
                
                 
                 <row>
                 
                    <input #newTag
                        (keyup.enter)="addTag(newTag.value); newTag.value=''"
                        type="text" class="mdl-textfield__input">
                 
                 
                    <a class="waves-effect waves-light"
                        (click)="addTag(newTag.value); newTag.value='' ">
                        <i class="material-icons">add</i>
                    </a>
                    
                 </row>
                </div>
                
                <br>
              
                
            </div>
        </div>   
       `
    ,
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProfileInfoComponent implements OnChanges {


    @Input()
    user: User;

    isMe: boolean = false;

    editMode: boolean = false;
    description: string;
    influenceplace: string;
    birthplace: string;
    birthdate: string;
    nickname: string;
    tags: Array<string> = [];

    constructor(private _profileService: ProfileService,
                private _authService: AuthService ) {

    }

    ngOnChanges(changes: {}): any {
        if (this.user != null) {
            this.description = this.user.description;
            this.influenceplace = this.user.influenceplace;
            this.birthplace = this.user.birthplace;
            this.birthdate = this.user.birthdate;
            this.nickname = this.user.nickname;
            this.tags = this.user.tags;

            //this.tags.push("test");

            // console.log(this.birthdate);

            if (this.birthdate != null) {
                this.birthdate = this.birthdate.substring(0, this.birthdate.indexOf('T'));
            }

            // console.log(this.birthdate);

            if (this._authService.getUserId() === this.user._id) {
                this.isMe = true;
            }
        }
        return null;
    }

    private editProfile() {
        this.editMode = true;
    }

    private saveEdits() {
        //this.editMode = false;
        var editUser = new User();
        editUser._id            = this.user._id;
        editUser.description    = this.description;
        editUser.influenceplace = this.influenceplace;
        editUser.birthplace     = this.birthplace;
        editUser.birthdate      = this.birthdate;
        editUser.nickname       = this.nickname;
        editUser.tags           = this.tags;

        this._profileService.editUser(editUser).subscribe(res => {
            this._profileService.getUserForId(this.user._id)
                .subscribe( user => {
                    if (user != null) {
                        this.user = user;
                    }
                });
            this.editMode = false;
        });
    }

    private cancel() {
        this.editMode = false;
    }

    private removeTag(tag: string) {
        // console.log(tag);

        var index = this.tags.indexOf(tag, 0);
        if (index > -1) {
            this.tags.splice(index, 1);
        }
    }

    private addTag(tag: string) {
        if (tag.length > 0) {
            this.tags.push(tag);
        }

    }
}
