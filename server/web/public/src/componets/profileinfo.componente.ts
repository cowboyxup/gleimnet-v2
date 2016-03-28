import {Component, Input} from "angular2/core";
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
    directives: [
        DatePicker
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
                
                <a (click)="editProfile()">Profil bearbeiten</a>
                
            </div>
            <div *ngIf="editMode"class="card-content">
                <h4>Exposé</h4>
                
                <h5>Geburtsdatum:</h5>
                
                <date-picker [options]="myDatePickerOptions" (dateChanged)="onDateChanged($event)" [selDate]="selectedDate">
                </date-picker>     
                           
                <p>{{user.birthdate | formatedDateFromString}}
                <h5>Beschreibung:</h5>
                <p>{{user.description}}</p>
                <h5>Wirkungsort:</h5>
                <p>{{user.influenceplace}}</p>
                <h5>Geburtsort:</h5>
                <p>{{user.birthplace}}</p>
                
                <a class="btn" (click)="cancel()">verwerfen</a>                
                <a class="btn" (click)="saveEdits()">speichern</a>
            </div>
        </div>   
       `
    ,
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProfileInfoComponent {
    selectedDate: string = '20.12.1715';

    @Input()
    user: User;

    editMode: boolean = false;

    private myDatePickerOptions = {
        todayBtnTxt: 'Today',
        dateFormat: 'dd.mm.yyyy',
        firstDayOfWeek: 'mo',
        sunHighlight: true,
        height: '34px',
        width: '260px'
    };

    constructor(private _profileService: ProfileService,
                private _authService: AuthService ) {}

    private editProfile() {
        this.editMode = true;
    }

    private saveEdits() {
        this.editMode = false;
    }

    private cancel() {
        this.editMode = false;
    }
}
