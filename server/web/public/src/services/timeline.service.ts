import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import {Response} from "angular2/http";
import {Headers} from "angular2/http";
import {Http} from "angular2/http";
import {Injectable} from "angular2/core";
import {headers} from "./common";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import {Observer} from "rxjs/Observer";
import {ProfileService} from "./profile.service";


@Injectable()
export class TimelineService {

    private _baseUrl:string = 'api/v1/timeline/';
    private timelineId:string;

    private _posts:Array<Post>;
    public  posts$: Observable<Array<Post>>;
    private _postsObserver: Observer<Array<Post>>;

    constructor(public _authHttp: AuthHttp,
                private _profileService: ProfileService) {
        this.posts$ = new Observable(observer =>
            this._postsObserver = observer).share();
    }

    private setPosts(posts:Array<Post>){

        posts.forEach(
            post =>{
                if(post.authorName == null){
                    this._profileService.getUserForId(post.author)
                        .subscribe(user =>{
                            if(user != null){
                                post.authorName = user.givenName;
                            }
                        });
                }

            }
        );

        this._posts = posts;
        this._postsObserver.next(this._posts);
    }

    load(timelineId: string) {
        this.timelineId = timelineId

        return this._authHttp.get(this._baseUrl + timelineId, { headers: headers() })
            .map((res:Response) => res.json())
            .subscribe(
                (timeline:pagedTimeline) => {
                    console.log(timeline);


                    this.setPosts(timeline.posts);

                    //timeline.messages.forEach( newPost =>{
                    //    if(!this._postDictionary.containsKey(newPost._id)){
                    //        this.add(newPost);
                    //    }else{
                    //        var oldPost:Post = this._postDictionary[newPost._id];
                    //
                    //        newPost.comments.forEach(comment =>{
                    //            if(typeof comment != 'undefined' && typeof comment._id != 'undefined') {
                    //                if (oldPost.containsCommentWithiD(comment._id)) {
                    //                    oldPost.addComment(comment);
                    //                    this.update();
                    //                }
                    //            }
                    //        })
                    //    }
                    //});
                },
                error => { console.log(error);}
            );
    }


    postNewPosting(content:string):any {

        var url = this._baseUrl + this.timelineId;
        let body = JSON.stringify({content });

        this._authHttp.post(url, body, { headers: headers() })
            .map(response =>  { })
            .subscribe(
                error => { console.log(error);
                });
    }

    commentOnPosting(content:string, postId:string):any {
        //var url = 'api/timeline/message/' + postId;
        //let body = JSON.stringify({content });
        //
        //return this._http.post(url, body, { headers: this.headers() })
        //    .map(response =>  {})
        //    .subscribe(
        //        response => {
        //            this.load(this.username);
        //        },
        //        error => { console.log(error);}
        //    );

    }
}

export class pagedTimeline{
    _id:string;
    items:{
        begin:number;
        ende:number;
        limit:number;
        total:number;
    }
    pages:{
        current: number;
        hasNext: boolean
        hasPrev: boolean;
        next: number
        prev: number;
        total: number;
    }
    posts:Post[];
    timeCreated:Date;
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
    authorName:string
    content:string;
    comments:Comment[];
}

export interface Comment{
    _id:string;
    author:string;
    content:string;
}
