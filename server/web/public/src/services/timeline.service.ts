import 'rxjs/add/operator/share';
import {Response} from "angular2/http";
import {Injectable} from "angular2/core";
import {headers} from "./common";
import {ProfileService} from "./profile.service";
import {User, Post, IdInterface, indexOfId} from "../models";
import {Subject} from "rxjs/Subject";
import {AuthHttp} from "../common/angular2-jwt";


@Injectable()
export class TimelineService {

    postSubject: Subject<Post> = new Subject<Post>();

    private _baseUrl: string = 'api/v1/timeline/';
    private timelineId: string;

    private _posts: Array<Post> = [];

    constructor(public _authHttp: AuthHttp) {
    }

    setTimeLineID(timelineId: string) {
        this._posts = [];
        this.timelineId = timelineId;
    }

    load() {
        if (this.timelineId != null) {
            return this._authHttp.get(this._baseUrl + this.timelineId, {headers: headers()})
                .map((res: Response) => {
                    return res.json();
                })
                .subscribe(
                    (timeline: PagedTimeline) => {
                        //console.log(timeline.posts);
                        this.setPosts(timeline.posts);
                    },
                    error => {
                        console.log(error);
                    }
                );
        }
    }

    postNewPosting(content: string): any {

        var url = this._baseUrl + this.timelineId;
        let body = JSON.stringify({content});

        this._authHttp.post(url, body, {headers: headers()})
            .map(response => {
                response.json();
            })
            .subscribe(
                res => {
                    this.load();
                },
                error => {
                    console.log(error);
                });
    }

    commentOnPosting(content: string, postId: string): any {
        var url = '/api/v1/post/' + postId;
        let body = JSON.stringify({content});

        return this._authHttp.post(url, body, {headers: headers()})
            .map(response => {
                response.json();
            })
            .subscribe(
                response => {
                    this.load();
                },
                error => {
                    console.log(error);
                }
            );
    }

    private setPosts(posts: Array<Post>) {

        posts.forEach(newPost => {
            let index: number = indexOfId(this._posts, newPost._id);

            if (index === -1) {
                this._posts.push(newPost);
                this.postSubject.next(newPost);

            } else {
                var oldPost: Post = this._posts[index];

                newPost.comments.forEach(comment => {

                    var commentIndex = -1;
                    const length = oldPost.comments.length;
                    for (let i = 0; i < length; i++) {
                        if (oldPost.comments[i]._id === comment._id) {
                            commentIndex = i;
                        }
                    }

                    if (commentIndex === -1) {
                        oldPost.comments.push(comment);
                    }
                });
            }
        });
    }
}

export class PagedTimeline {
    _id: string;
    items: {
        begin: number;
        ende: number;
        limit: number;
        total: number;
    };
    pages: {
        current: number;
        hasNext: boolean
        hasPrev: boolean;
        next: number
        prev: number;
        total: number;
    };
    posts: Post[];
    timeCreated: Date;
}
