export class User {
    _id:  string;
    avatar:  string;
    birthdate: string;
    birthplace: string;
    description:  string;
    friends: string[];
    givenName: string;
    surname: string;
    influenceplace:  string;
    nickname: string;
    tags:  string[];
    timeCreated:  string;
    timeline:  string;
    titlePicture:  string;
}

export class Thread implements IdInterface {
    _id: string;
    lastMessage: Message;
    name: string;
    avatarSrc: string;
    timeUpdated: string;
    authorIds: string[] = new Array<string>();
}

export class Message {
    id: string;
    sentAt: Date;
    isRead: boolean;
    author: User;
    text: string;
    thread: Thread;
}


export class Paged<T>{
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
    data: Array<T>;
    timeCreated: Date;
}


export interface IdInterface {
    _id: string;
}


export class Post implements IdInterface {

    _id: string;

    author: string;
    timeCreated: string;
    content: string;
    comments: Comment[];

    authorName: string;
    authorAvatar: string;

    constructor(id: string, author: string, content: string) {
        this._id = id;
        this.author = author;
        this.content = content;
    }

    containsCommentWithiD(id: string): boolean {
        var contains: boolean = false;
        this.comments.forEach(comment => {
            if (comment._id === id) {
                return true;
            }
        });

        return false;
    }

    addComment(comment: Comment) {
        this.comments.push(comment);
    }
}

export class Comment implements IdInterface {
    _id: string;
    author: string;
    content: string;

    authorName: string;
    authorAvatar: string;
}

export function indexOfId(array: IdInterface[], id: string): number {
    const length = array.length;
    for (let i = 0; i < length; i++) {
        if (array[i]._id === id) {
            // console.log(i);
            return i;
        }
    }
    // console.log(-1);
    return -1;
}
