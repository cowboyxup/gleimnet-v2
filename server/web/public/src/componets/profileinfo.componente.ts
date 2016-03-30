import {Component, Input, OnInit, Output} from "angular2/core";
import {User} from "../models";
import {ProfileService} from "../services/profile.service";
import {FormatedDateFromStringPipe} from "../util/dateFormat.pipe";
import {AuthService} from "../services/auth.service";
import {DatePicker} from "../common/datePicker/datepicker";

@Component({
    selector: 'profileInfo',
    pipes: [
        FormatedDateFromStringPipe
    ],
    template: `
        <div class="card profile_info">
            <div *ngIf="!editMode" class="card-content">
                <h4>Exposé</h4>
                
                <h5>Geburtsdatum:</h5>
                <p>{{user.birthdate | formatedDateFromString}}
                <h5>Beschreibung:</h5>
                <p>{{user.description}}</p>
                <h5>Wirkungsort:</h5>
                <p>{{user.influenceplace}}</p>
                <h5>Geburtsort:</h5>
                <p>{{user.birthplace}}</p>
                
                <h5>Tags:</h5>
                
                <div class="tags">
                 <span class="chip" *ngFor="#tag of tags">
                    {{tag}}
                 </span>
                </div>
               
                
                <a (click)="editProfile()">Profil bearbeiten</a>
                
            </div>
            <div *ngIf="editMode"class="card-content">
                <h4>Exposé</h4>
                
                <h5>Geburtsdatum:</h5>
                <input [(ngModel)]="influenceplace" type="date">
                <p>{{user.birthdate | formatedDateFromString}}
                <h5>Beschreibung:</h5>
                
                <textarea placeholder="Beschreibung" class="materialize-textarea" [(ngModel)]="description" ></textarea>
               
                <h5>Wirkungsort:</h5>
                
                <input placeholder="Wirkungsort" [(ngModel)]="influenceplace" type="text">
                
                <h5>Geburtsort:</h5>
                
                <input placeholder="Wirkungsort" [(ngModel)]="birthplace" type="text">
                
                <h5>Tags:</h5>
                
                 <div class="tags">
                 <span class="chip" *ngFor="#tag of tags">
                    {{tag}}
                    <a (click)="removeTag(tag)">entfernen</a>
                 </span>
                
                 
                 <input #newTag
                    (keyup.enter)="addTag(newTag.value); newTag.value=''"
                    type="text" class="mdl-textfield__input">
                 
                 <row>
                    <button class="waves-effect waves-light btn send_Button"
                        (click)="addTag(newTag.value); newTag.value='' ">
                        Tag hinzufügen
                    </button>
                 </row>
                </div>
                
                <br>
              
                <a class="btn" (click)="cancel()">verwerfen</a>                
                <a class="btn" (click)="saveEdits()">speichern</a>
            </div>
        </div>   
       `
    ,
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProfileInfoComponent implements OnInit {

    @Input()
    user: User;

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

    ngOnInit() {
        this.description    = this.user.description;
        this.influenceplace = this.user.influenceplace;
        this.birthplace     = this.user.birthplace;
        this.birthdate      = this.user.birthdate;
        this.nickname       = this.user.nickname;
        this.tags           = this.user.tags;
        //this.tags.push("test");
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
        // editUser.birthdate      = this.birthdate;
        editUser.nickname       = this.nickname;
        editUser.tags           = this.tags;

        this._profileService.editUser(editUser).subscribe(res => {
            // this._profileService.getUserForId(this.userId)
            //     .subscribe( user => {
            //         if (user != null) {
            //             this.user =user;
            //         }
            //     });
            this.editMode = false;
        });
    }

    private cancel() {
        this.editMode = false;
    }

    private removeTag(tag: string) {
        console.log(tag);

        var index = this.tags.indexOf(tag, 0);
        if (index > -1) {
            this.tags.splice(index, 1);
        }
    }

    private addTag(tag: string) {
        this.tags.push(tag);
    }
}
