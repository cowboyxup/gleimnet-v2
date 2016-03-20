import {MessagesService} from './MessagesService';
import {threadsServiceInjectables} from './ThreadsService';
import {userServiceInjectables} from './UserService';

export * from './MessagesService';
 export * from './ThreadsService';
export * from './UserService';

export var servicesInjectables: Array<any> = [
  MessagesService,
  threadsServiceInjectables,
  userServiceInjectables
];
