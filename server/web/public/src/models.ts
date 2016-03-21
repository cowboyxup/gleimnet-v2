import { uuid } from './util/uuid';


export class User{
    _id:  string;
    avatar:  string;
    birthdate: string;
    birthplace: string;
    description:  string;
    friends: string[];
    givenName: string;
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