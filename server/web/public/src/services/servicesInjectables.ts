
import {MessagesService} from "./chat/MessagesService";
import {threadsServiceInjectables} from "./chat/ThreadsService";
import {userServiceInjectables} from "./chat/UserService";

export * from "./chat/MessagesService";
export * from "./chat/ThreadsService";
export * from "./chat/UserService";

export var servicesInjectables: Array<any> = [
    MessagesService,
    threadsServiceInjectables,
    userServiceInjectables
];
