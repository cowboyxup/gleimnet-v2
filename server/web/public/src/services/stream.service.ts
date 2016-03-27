import {Injectable} from "angular2/core";
import {Subject} from "rxjs/Subject";
import {Post, Paged, IdInterface} from "../models";
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

    private indexOf(array: IdInterface[], item: IdInterface): number {
        const length = array.length;
        for (let i = 0; i < length; i++) {
            if (array[i]._id === item._id) {
                // console.log(i);
                return i;
            }
        }
        // console.log(-1);
        return -1;
    }

    private setPosts(posts: Array<Post>) {

        if (posts !== null) {

            let self = this;

            posts.forEach(newPost => {
                let index: number = self.indexOf(self._posts, newPost);

                if (index === -1) {

                    self._posts.push(newPost);
                    self.postSubject.next(newPost);
                } else {
                    var oldPost: Post = this._posts[index];

                    newPost.comments.forEach(comment => {

                        var commentIndex = -1;
                        const length = oldPost.comments.length;
                        for (let i = 0; i < length; i++) {
                            if (oldPost.comments[i]._id ===  comment._id) {
                                // console.log(i);
                                commentIndex = i;
                            }
                        }
                        //console.log(commentIndex);
                        if (commentIndex === -1) {

                            oldPost.comments.push(comment);
                        }
                    });
                    //oldPost.setComments(newPost.comments);
                }

            });
        }
    }
}
