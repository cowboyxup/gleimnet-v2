import {Injectable} from "angular2/core";
import {Subject} from "rxjs/Subject";
import {Post, Paged, IdInterface, indexOfId} from "../models";
import {headers} from "./common";
import {Response} from "angular2/http";
import {AuthHttp} from "../common/angular2-jwt";

@Injectable()
export class StreamService {

    postSubject: Subject<Post> = new Subject<Post>();

    private apiBaseUrl: string = 'api/v1/stream';
    private _posts: Array<Post> = [];


    constructor(public _http: AuthHttp) {

    }

    public load() {
        return this._http.get(this.apiBaseUrl, {headers: headers()})
            .map((res: Response) => res.json())
            .subscribe(
                (timeline: Paged<Post>) => {
                    this.setPosts(timeline.data);
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
