import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import {Response} from "angular2/http";
import {Injectable} from "angular2/core";
import {headers} from "./common";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import {Observer} from "rxjs/Observer";
import {ProfileService} from "./profile.service";
import {User, Post, idI} from "../models";
import {Subject} from "rxjs/Subject";
import {indexOf} from "../common/arrays";


@Injectable()
export class TimelineService {

    private _baseUrl:string = 'api/v1/timeline/';
    private timelineId:string;

    private _posts:Array<Post> = new Array<Post>();
    public  posts$: Observable<Array<Post>>;
    private _postsObserver: Observer<Array<Post>>;

    postSubject:Subject<Post> = new Subject<Post>();

    constructor(public _authHttp: AuthHttp,
                private _profileService: ProfileService) {
        this.posts$ = new Observable(observer =>
            this._postsObserver = observer).share();
    }

    setTimeLineID(timelineId: string){
        this.timelineId = timelineId;
    }


    indexOf(array: idI[], item: idI): number {
        const length = array.length;
        for (let i = 0; i < length; i++) {
            if (array[i]._id ==  item._id) {
                // console.log(i);
                return i;
            }
        }
        // console.log(-1);
        return -1;
    }

    private setPosts(posts:Array<Post>){

        posts.forEach(newPost =>{
            let index:number = this.indexOf(this._posts, newPost)

            if(index == -1){
                this._posts.push(newPost);
                this.postSubject.next(newPost);
            }else{
                var oldPost:Post = this._posts[index];

                newPost.comments.forEach(comment =>{

                    var commentIndex = -1;
                    const length = oldPost.comments.length;
                    for (let i = 0; i < length; i++) {
                        if (oldPost.comments[i]._id ==  comment._id) {
                            // console.log(i);
                            commentIndex = i;
                        }
                    }

                    console.log(commentIndex);

                    if(commentIndex == -1){

                        oldPost.comments.push(comment);
                    }

                });

                //oldPost.setComments(newPost.comments);
            }

        });

        // posts.forEach(
        //     post =>{
        //         if(post.authorName == null){
        //             this._profileService.getUserForId(post.author)
        //                 .subscribe((user:User) =>{
        //                     if(user != null){
        //                         console.log(user);
        //                         post.authorName = user.givenName;
        //                         //console.log(post.authorName);
        //
        //                     }
        //                 });
        //         }
        //
        //     }
        // );

        // this._posts = posts;
        // this._postsObserver.next(this._posts);
    }

    load() {
        if(this.timelineId != null) {
            return this._authHttp.get(this._baseUrl + this.timelineId, {headers: headers()})
                .map((res:Response) => res.json())
                .subscribe(
                    (timeline:pagedTimeline) => {
                        this.setPosts(timeline.posts);
                    },
                    error => {
                        console.log(error);
                    }
                );
        }
    }

    postNewPosting(content:string):any {

        var url = this._baseUrl + this.timelineId;
        let body = JSON.stringify({content });

        this._authHttp.post(url, body, { headers: headers() })
            .map(response =>  { })
            .subscribe(
                res =>{
                    this.load()
                },
                error => { console.log(error);
                });
    }

    commentOnPosting(content:string, postId:string):any {
        var url = '/api/v1/post/' + postId;
        let body = JSON.stringify({content });

        return this._authHttp.post(url, body, { headers: headers() })
           .map(response =>  {})
           .subscribe(
               response => {
                   this.load();
               },
               error => { console.log(error);}
           );

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


