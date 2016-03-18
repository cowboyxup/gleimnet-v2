import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import {Response} from "angular2/http";
import {Headers} from "angular2/http";
import {Http} from "angular2/http";
import {Injectable} from "angular2/core";

import {headers} from "./common";
import {AuthHttp} from "angular2-jwt/angular2-jwt";

@Injectable()
export class StreamService {

    //_postDictionary:Dictionary<Post>;
    private apiBaseUrl:string = 'api/vi1/stream'

    private username:string;

    constructor(public _http: AuthHttp) {
        //this._postDictionary = new Dictionary<Post>([]);
    }


    add(value: Post) {
        //this._postDictionary.addFront(value._id,value);
    }

    private update(){
        //this._postDictionary.update();
    }

    load() {

        return this._http.get(this.apiBaseUrl, {headers:  headers()})
            .map((res:Response) => res.json())
            .subscribe(
                (timeline:Timeline) => {
                    timeline.messages.forEach( newPost =>{
                        //if(!this._postDictionary.containsKey(newPost._id)){
                        //    this.add(newPost);
                        //}else{
                        //    var oldPost:Post = this._postDictionary[newPost._id];
                        //
                        //    newPost.comments.forEach(comment =>{
                        //        if(typeof comment != 'undefined' && typeof comment._id != 'undefined') {
                        //            if (oldPost.containsCommentWithiD(comment._id)) {
                        //                oldPost.addComment(comment);
                        //                this.update();
                        //            }
                        //        }
                        //    })
                        //}
                    });
                },
                error => { console.log(error.message);}
            );
    }


    postNewPosting(username:string, content:string):any {
        this.username = username

        var url = 'api/timeline/' + username;
        let body = JSON.stringify({content });

        this._http.post(url, body, {headers:  headers()})
            .map(response =>  { })
            .subscribe(
                error => { console.log(error);
                });
    }

    commentOnPosting(content:string, postId:string):any {
        var url = 'api/timeline/message/' + postId;
        let body = JSON.stringify({content });

        return this._http.post(url, body, {headers:  headers()})
            .map(response =>  {})
            .subscribe(
                response => {
                    this.load();
                },
                error => { console.log(error);}
            );
    }
}

export class Timeline{
    _id:string;
    messages:Post[];
}

export class Post{

    constructor(id:string, author:string, content:string) {
        this._id = id;
        this.author = author;
        this.content = content;
    }

    containsCommentWithiD(id:string):boolean{
        var contains:boolean = false;
        this.comments.forEach(comment => {
            if (comment._id == id) {
                return true;
            }
        })

        return false;
    }

    addComment(comment:Comment){
        this.comments.push(comment);
    }

    _id:string;
    author:string;
    content:string;
    comments:Comment[];
}

export interface Comment{
    _id:string;
    author:string;
    content:string;
}