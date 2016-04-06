import { Component} from "angular2/core";
import {ProtectedDirective} from "../directives/protected.directive";
import {AuthService} from "../services/auth.service";
import {AdminService} from "../services/admin.service";
import {FORM_DIRECTIVES, CORE_DIRECTIVES} from "angular2/common";

@Component({
    selector: 'login',
    directives: [
        ProtectedDirective
    ],
    template: `
        <div protected class="row">
            <div class="col s4">
                <div class="card">
                    <div class="card-content">
                        <span class="card-title">Sitzungen laden</span>
                        
                         <ul class="collection">
                            <li *ngFor="#s of saved" class="collection-item"
                                [class.active]="s === selected"
                                 (click)="onSelect(s)">
                                {{s}}
                            </li>
                        </ul>
                        
                         <a class="waves-effect waves-light btn"
                                (click)="load();" type="button">
                               Sitzung laden
                          </a>
                    </div>
                </div>
            </div>

            <div class="col s4">
                <div class="card">
                    <div class="card-content">
                        <span class="card-title">Sitzung sichern</span>
                        
                         <form>
                            <div class="row">
                                <div class="input-field col s12">
                                    <input #institution type="text"  type="text">
                                    <label for="password">Institution</label>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="input-field col s12">
                                    <input #group  type="text">
                                    <label for="password">Group</label>
                                </div>
                            </div>
        
        
                            <a class="waves-effect waves-light btn"
                                (click)="save(institution.value, group.value );" type="button">
                                    Sitzung sichern
                            </a>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="col s4">
                <div class="card">
                    <div class="card-content">
                        <span class="card-title">PDF Export</span>
                        
                        <p>
                            <a class="waves-effect waves-light btn"
                                href="/admin/v1/export" target="_blank" type="button">
                                    Sitzung als PDF exportieren
                            </a>
                        </p>
                         
                    </div>
                 </div>
                 <div class="card">
                    <div class="card-content">
                        <span class="card-title">SetUp</span>
                        
                        <p>
                            <a class="waves-effect waves-light btn"
                                (click)="setup();" type="button">
                                    Leerprofile Einspielen
                            </a>
                        </p>
                         
                    </div>
                 </div>
            </div>      
         </div>
`
})

export class AdminPanelComponent {

    saved: Array<string> = [];

    selected = "";

    constructor(private authService: AuthService,
                private adminService: AdminService) {

        this.adminService.savedSessions.subscribe((savedSessions: Array<string>) => {
            this.saved = savedSessions;
            console.log(this.saved);
        });

        this.adminService.loadSaved();
    }

    load() {
        if (this.selected !== "") {
            this.adminService.load(this.selected);
        }
    }

    onSelect(s: string) { this.selected = s; }

    save(institution: string, group: string) {
        this.adminService.save(institution, group);
    }

    export() {
        this.adminService.export();
    }

    setup() {
        this.adminService.setup();
    }

}
