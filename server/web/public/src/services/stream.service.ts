import {Response} from "angular2/http";
import {Injectable} from "angular2/core";
import {headers} from "./common";
import {AuthHttp} from "angular2-jwt/angular2-jwt";
import {Post, idI, Paged} from "../models";
import {Subject} from "rxjs/Subject";
import {pagedTimeline} from "./timeline.service";
import {isUndefined} from "../common/util";
import "rxjs/add/operator/share";

@Injectable()
export class StreamService {

    private apiBaseUrl:string = 'api/v1/stream'

    postSubject:Subject<Post> = new Subject<Post>();
    private _posts:Array<Post> = new Array<Post>();


    constructor(public _http:AuthHttp) {

    }

    indexOf(array:idI[], item:idI):number {
        const length = array.length;
        for (let i = 0; i < length; i++) {
            if (array[i]._id == item._id) {
                // console.log(i);
                return i;
            }
        }
        // console.log(-1);
        return -1;
    }

    private setPosts(posts:Array<Post>) {

        if (!isUndefined(posts)) {

            posts.forEach(newPost => {
                let index:number = this.indexOf(this._posts, newPost)

                if (index == -1) {
                    this._posts.push(newPost);
                    this.postSubject.next(newPost);
                } else {
                    var oldPost:Post = this._posts[index];

                    newPost.comments.forEach(comment => {

                        var commentIndex = -1;
                        const length = oldPost.comments.length;
                        for (let i = 0; i < length; i++) {
                            if (oldPost.comments[i]._id == comment._id) {
                                // console.log(i);
                                commentIndex = i;
                            }
                        }

                        //console.log(commentIndex);

                        if (commentIndex == -1) {

                            oldPost.comments.push(comment);
                        }

                    });

                    //oldPost.setComments(newPost.comments);
                }

            });
        }
    }

    load() {
        return this._http.get(this.apiBaseUrl, {headers: headers()})
            .map((res:Response) => res.json())
            .subscribe(
                (timeline:Paged<Post>) => {
                    this.setPosts(timeline.data);
                },
                error => {
                    console.log(error);
                }
            );

    }

}
