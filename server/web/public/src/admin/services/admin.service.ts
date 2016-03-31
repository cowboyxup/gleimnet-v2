import {Injectable} from "angular2/core";
import {Subject} from "rxjs/Subject";
import {headers} from "../../services/common";
import {Response} from "angular2/http";
import {AuthHttp} from "../../common/angular2-jwt";

@Injectable()
export class AdminService {
    baseUrl: string = "admin/v1";

    savedSessions: Subject<Array<string>> = new Subject<Array<string>>();

    constructor(private _http: AuthHttp) {}

    loadSaved() {
        this._http.get(this.baseUrl + "/saved", {headers: headers()})
            .map((res: Response) => res.json())
            .subscribe(
                (res: PathList) => {
                    console.log(res);
                    var a: string[] = [];

                    res.files.forEach( path => {
                        a.push(path.path);
                    });

                    this.savedSessions.next(a);
                });
    }

    save(institution: string, group: string) {

        let body = JSON.stringify({institution, group});

        this._http.post(this.baseUrl + "/save" , body, {headers: headers()})
            .map((res: Response) => res.json())
            .subscribe(
                (res) => {
                    console.log(res);
                    this.loadSaved();
                },
                error => {
                    console.log("fehler");
                }
            );
    }

    load(filepath: string) {
        let body = JSON.stringify({filepath});

        this._http.post(this.baseUrl + "/load" , body, {headers: headers()})
            .map((res: Response) => res.json())
            .subscribe(
                (res) => {

                    console.log(res);
                    this.loadSaved();
                },
                error => {
                    console.log("fehler");
                }
            );
    }

    export() {
        this._http.get(this.baseUrl + "/export", {headers: headers()})
            .map((res: Response) => window.open("data:application/pdf," + res))
            .subscribe(
                res => {

                    // console.log(res);

                });
    }

    setup() {
        this._http.get(this.baseUrl + "/setups", {headers: headers()})
            .map((res: Response) => console.log(res))
            .subscribe(
                res => {
                    // console.log(res);
                });
    }
}

class PathList {
    files: GLeimNetSession[];
}

export class GLeimNetSession {
    path: string;
}
