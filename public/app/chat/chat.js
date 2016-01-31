System.register(['angular2/core', "./chat.service", "../home/profile.service"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, chat_service_1, chat_service_2, profile_service_1, chat_service_3, profile_service_2;
    var Chat;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (chat_service_1_1) {
                chat_service_1 = chat_service_1_1;
                chat_service_2 = chat_service_1_1;
                chat_service_3 = chat_service_1_1;
            },
            function (profile_service_1_1) {
                profile_service_1 = profile_service_1_1;
                profile_service_2 = profile_service_1_1;
            }],
        execute: function() {
            Chat = (function () {
                function Chat(_chatService, _profileService) {
                    this._chatService = _chatService;
                    this._profileService = _profileService;
                    //auth = localStorage.getItem('AuthKey');
                    this.username = localStorage.getItem('username');
                    this.myConversations = new chat_service_3.ConversationGroup();
                    this.userDict = {};
                    this.messageDict = {};
                    this.username = localStorage.getItem('username');
                }
                Chat.prototype.ngOnInit = function () {
                    var basicAuth = localStorage.getItem('AuthKey');
                    if (basicAuth) {
                        this.loadConversations();
                    }
                };
                Chat.prototype.newConversation = function (username) {
                    if (this.username) {
                        if (username) {
                            this._chatService.newConversation(username)
                                .subscribe(function (res) {
                                console.log(res);
                            });
                        }
                    }
                };
                Chat.prototype.loadConversations = function () {
                    var _this = this;
                    if (this.username) {
                        this._chatService.loadConversations()
                            .subscribe(function (res) {
                            _this.myConversations = res;
                            console.log(_this.myConversations);
                            _this.myConversations.conversations.forEach(function (conversation) {
                                conversation.authors.forEach(function (user) {
                                    if (!_this.userDict[user.id])
                                        _this.userDict[user.id] = new profile_service_1.User();
                                });
                                conversation.messages.forEach(function (message) {
                                    if (!_this.messageDict[message.id])
                                        _this.messageDict[message.id] = new chat_service_2.Message();
                                });
                            });
                            for (var userKey in _this.userDict) {
                                if (_this.userDict.hasOwnProperty(userKey)) {
                                    if (_this.userDict[userKey]._id == null) {
                                        _this._profileService.loadProfilInfosWithID(userKey)
                                            .subscribe(function (user) {
                                            _this.userDict[user._id] = user;
                                        }, function (error) {
                                            console.log(error.message);
                                        });
                                    }
                                }
                            }
                            for (var messageKey in _this.messageDict) {
                                if (_this.messageDict.hasOwnProperty(messageKey)) {
                                    if (_this.messageDict[messageKey]._id == null) {
                                        _this._chatService.loadMessage(messageKey)
                                            .subscribe(function (message) {
                                            _this.messageDict[message._id] = message;
                                        }, function (error) {
                                            console.log(error.message);
                                        });
                                    }
                                }
                            }
                        }, function (error) {
                            console.log(error.message);
                        });
                    }
                };
                Chat.prototype.sendNewMessage = function (content, conversationId) {
                    var _this = this;
                    console.log(content);
                    console.log(conversationId);
                    if (conversationId) {
                        this._chatService.sendNewMessage(content, conversationId)
                            .subscribe(function (res) {
                            console.log(res);
                            _this.loadConversations();
                        });
                    }
                };
                Chat.prototype.onSelect = function (conversation) {
                    console.log("onSelect");
                    this.actConversation = conversation;
                };
                Chat = __decorate([
                    core_1.Component({
                        selector: 'Chat',
                        templateUrl: './app/chat/chat.html',
                        providers: [chat_service_1.ChatService, profile_service_2.ProfileService]
                    }), 
                    __metadata('design:paramtypes', [chat_service_1.ChatService, profile_service_2.ProfileService])
                ], Chat);
                return Chat;
            })();
            exports_1("Chat", Chat);
        }
    }
});
//# sourceMappingURL=chat.js.map