import { uuid } from './util/uuid';


export class User{
    _id:  string;
    avatar:  string;
    birthdate: string;
    birthplace: string;
    description:  string;
    friends: string[];
    givenName: string;
    surname:string;
    influenceplace:  string;
    nickname: string;
    tags:  string[];
    timeCreated:  string;
    timeline:  string;
    titlePicture:  string;

    constructor(public name: string) {
        this._id = uuid();
        this.avatar='assets/img/profileimages/schiller.png';
    }
}

export class Thread {
    id: string;
    lastMessage: Message;
    name: string;
    avatarSrc: string;

    constructor(id?: string,
                name?: string,
                avatarSrc?: string) {
        this.id = id || uuid();
        this.name = name;
        this.avatarSrc = avatarSrc;
    }
}

export class Message {
    id: string;
    sentAt: Date;
    isRead: boolean;
    author: User;
    text: string;
    thread: Thread;

    constructor(obj?: any) {
        this.id              = obj && obj.id              || uuid();
        this.isRead          = obj && obj.isRead          || false;
        this.sentAt          = obj && obj.sentAt          || new Date();
        this.author          = obj && obj.author          || null;
        this.text            = obj && obj.text            || null;
        this.thread          = obj && obj.thread          || null;
    }
}


export class Paged<T>{
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
    data:Array<T>;
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