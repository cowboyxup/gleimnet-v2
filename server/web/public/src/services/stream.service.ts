import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import {Response} from "angular2/http";
import {Headers} from "angular2/http";
import {Http} from "angular2/http";
import {Injectable} from "angular2/core";

import {headers} from "./common";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import {Post, Paged} from "../models";
import {Subject} from "rxjs/Subject";

@Injectable()
export class StreamService {

    private apiBaseUrl:string = 'api/v1/stream'

    posts:Subject<Array<Post>> = new Subject<Array<Post>>();


    constructor(public _http: AuthHttp) {

    }

    load() {
        this._http.get(this.apiBaseUrl, {headers: headers()})
            .map((res:Response) => res.json())
            .subscribe(
                (res:Paged<Post>) => {
                    console.log(res);
                    this.posts.next(res.data);
                }
            );
    }

}
