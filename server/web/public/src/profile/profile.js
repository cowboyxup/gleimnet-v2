var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var router_1 = require('angular2/router');
var router_2 = require("angular2/router");
var profile_service_1 = require("../services/profile.service");
var chat_service_1 = require("../services/chat.service");
var friendsService_1 = require("../services/friendsService");
var timeline_service_1 = require("../services/timeline.service");
var post_component_1 = require("../stream/post.component");
var Profile = (function () {
    function Profile(_router, _profileService, _routeParams, _friendsService, _chatService) {
        this._router = _router;
        this._profileService = _profileService;
        this._routeParams = _routeParams;
        this._friendsService = _friendsService;
        this._chatService = _chatService;
        this.user = new profile_service_1.User();
        this.isMe = false;
        this.addFriendButton = true;
        this.username = this._routeParams.get('id');
        if (this.username == null) {
            this.username = localStorage.getItem('username');
            this.isMe = true;
        }
        else if (this.username == localStorage.getItem('username')) {
            this.isMe = true;
        }
        else {
            this.isMe = false;
        }
    }
    Profile.prototype.ngOnInit = function () {
        var basicAuth = localStorage.getItem('AuthKey');
        if (basicAuth) {
            this.loadProfilInfos();
            this.loadTimeline();
        }
    };
    Profile.prototype.ngOnDestroy = function () {
        clearInterval(this.interval);
    };
    Profile.prototype.loadProfilInfos = function () {
        var _this = this;
        if (this.username) {
            this._profileService.loadProfilInfos(this.username)
                .subscribe(function (res) {
                _this.user = res;
                _this.user.dateString = _this._profileService.getDateString(_this.user.birthdate);
                _this.friends = _this.user.friends;
            }, function (error) { console.log(error.message); });
        }
    };
    Profile.prototype.loadTimeline = function () {
        var _this = this;
        if (this.username) {
            this._profileService.loadTimeline(this.username)
                .subscribe(function (res) { _this.messages = res.messages; }, function (error) { console.log(error.message); });
        }
    };
    Profile.prototype.postNewPosting = function (content) {
        var _this = this;
        if (this.username) {
            this._profileService.postNewPosting(this.username, content)
                .subscribe(function (response) {
                _this.loadTimeline();
            }, function (error) { console.log(error.message); });
        }
    };
    Profile.prototype.commentOnPosting = function (content, postId) {
        var _this = this;
        if (this.username) {
            this._profileService.commentOnPosting(content, postId)
                .subscribe(function (response) {
                _this.loadTimeline();
            }, function (error) { console.log(error.message); });
        }
    };
    Profile.prototype.addAsFriend = function () {
        var _this = this;
        if (this.username) {
            this._friendsService.requestFriendship(this.username)
                .subscribe(function (response) {
                _this.addFriendButton = false;
            }, function (error) { console.log(error.message); });
        }
    };
    Profile.prototype.sendMessage = function () {
        var _this = this;
        if (this.username) {
            this._chatService.newConversation(this.username)
                .subscribe(function (response) {
                console.log(response);
                _this._router.navigateByUrl('/chat');
            }, function (error) { console.log(error.message); });
        }
    };
    Profile = __decorate([
        core_1.Component({
            selector: 'Profile',
            directives: [post_component_1.TimeLinePostComponent],
            providers: [post_component_1.TimeLinePostComponent, profile_service_1.ProfileService, friendsService_1.FriendsService, chat_service_1.ChatService, timeline_service_1.TimelineService],
            templateUrl: './app/profile/profile.html',
        }), 
        __metadata('design:paramtypes', [router_2.Router, profile_service_1.ProfileService, router_1.RouteParams, friendsService_1.FriendsService, chat_service_1.ChatService])
    ], Profile);
    return Profile;
})();
exports.Profile = Profile;
//# sourceMappingURL=profile.js.map