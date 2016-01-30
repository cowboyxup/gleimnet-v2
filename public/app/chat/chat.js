System.register(['angular2/core', "./chat.service"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, chat_service_1;
    var Chat, CONVERSATIONS;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (chat_service_1_1) {
                chat_service_1 = chat_service_1_1;
            }],
        execute: function() {
            Chat = (function () {
                function Chat(_chatService) {
                    this._chatService = _chatService;
                    this.conversations = CONVERSATIONS;
                }
                Chat = __decorate([
                    core_1.Component({
                        selector: 'Chat',
                        templateUrl: './app/chat/chat.html',
                        providers: [chat_service_1.ChatService]
                    }), 
                    __metadata('design:paramtypes', [chat_service_1.ChatService])
                ], Chat);
                return Chat;
            })();
            exports_1("Chat", Chat);
            CONVERSATIONS = [
                {
                    "_id": "string",
                    "users": [
                        {
                            "username": "Schiller"
                        },
                        {
                            "username": "Goethe"
                        }
                    ],
                    "messages": [
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        },
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        }
                    ]
                },
                {
                    "_id": "string",
                    "users": [
                        {
                            "username": "Schiller"
                        },
                        {
                            "username": "Goethe"
                        }
                    ],
                    "messages": [
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        },
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        }
                    ]
                },
                {
                    "_id": "string",
                    "users": [
                        {
                            "username": "Schiller"
                        },
                        {
                            "username": "Goethe"
                        }
                    ],
                    "messages": [
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        },
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        }
                    ]
                }
            ];
            CONVERSATIONS = [
                {
                    "_id": "string",
                    "users": [
                        {
                            "username": "Schiller"
                        },
                        {
                            "username": "Goethe"
                        }
                    ],
                    "messages": [
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        },
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        }
                    ]
                },
                {
                    "_id": "string",
                    "users": [
                        {
                            "username": "Schiller"
                        },
                        {
                            "username": "Goethe"
                        }
                    ],
                    "messages": [
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        },
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        }
                    ]
                },
                {
                    "_id": "string",
                    "users": [
                        {
                            "username": "Schiller"
                        },
                        {
                            "username": "Goethe"
                        }
                    ],
                    "messages": [
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        },
                        {
                            "author": {
                                "username": "Schiller"
                            },
                            "time": "jetzt",
                            "content": "Hallo"
                        },
                        {
                            "author": {
                                "username": "Goethe"
                            },
                            "time": "jetzt",
                            "content": "Hallo du"
                        }
                    ]
                }
            ];
        }
    }
});
//# sourceMappingURL=chat.js.map