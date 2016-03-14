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
var profile_service_1 = require("../../services/profile.service");
var chat_service_1 = require("../../services/chat.service");
var friendsService_1 = require("../../services/friendsService");
var timeline_service_1 = require("../../services/timeline.service");
var post_component_1 = require("../stream/post.component");
var protected_directive_1 = require("../../directives/protected.directive");
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
            directives: [
                post_component_1.TimeLinePostComponent,
                protected_directive_1.ProtectedDirective
            ],
            providers: [
                post_component_1.TimeLinePostComponent,
                profile_service_1.ProfileService,
                friendsService_1.FriendsService,
                chat_service_1.ChatService,
                timeline_service_1.TimelineService
            ],
            template: "\n        <div protected>\n\n<div class=\"titelImage\" style=\"background-image:url('img/banner/banner_{{user.username}}.jpg')\">\n\n    <img *ngIf=\"user.username\" class=\"thumbnail profilimage\" src=\"img/profilimages/240x240/{{user.avatar}}.png\"\n                 alt=\"...\">\n\n</div>\n\n    <div class=\"profile_name_box mdl-card mdl-shadow--4dp\">\n        <div class=\"mdl-card__supporting-text\">\n        <h4>\n            {{user.givenName}} {{user.surename}}\n        </h4>\n        <div class=\"row\">\n            <button *ngIf=\"addFriendButton && !isMe\" type=\"button\"\n                    class=\"btn btn-default btn-sm pull-right\"\n                    (click)=\"addAsFriend()\">\n                <span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span>\n                Freund hinzuf\u00FCgen\n            </button>\n\n            <button *ngIf=\"!isMe\" type=\"button\"\n                    class=\"btn btn-default btn-sm pull-right\"\n                    (click)=\"sendMessage()\">\n                <span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\n                Nachricht senden\n            </button>\n        </div>\n        </div>\n    </div>\n\n\n<div class=\"mdl-grid\">\n    <div class=\"mdl-cell mdl-cell--3-col\">\n        <div class=\"mdl-card mdl-shadow--4dp mdl-cell mdl-cell--12-col profile_info\">\n            <div class=\"mdl-card__supporting-text\">\n                <div class=\"row\">\n                    <h4>Geburtsdatum:</h4>\n                    <p>{{userateString}}\n                    <h4>Info:</h4>\n                    <p>{{userescription}}</p>\n                </div>\n\n\n                <h4>Freunde</h4>\n                <div class=\"col-md-4 friendImage\" *ngFor=\"#Friend of friends\">\n                    <div class=\"mdl-color-text--grey-700 posting_header meta\">\n                        <a class=\"\" href=\"#/profile/{{Friend.username}}\" role=\"button\">\n                            <img src=\"img/profilimages/64x64/{{Friend.username}}.png\" class=\"round_avatar\">\n                        </a>\n                        <div class=\"comment__author\">\n                            <strong>{{Friend.givenName}}</strong>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n    <div class=\"mdl-cell mdl-cell--9-col\">\n        <div class=\"mdl-card mdl-shadow--4dp mdl-cell mdl-cell--12-col stream_form\">\n            <form>\n                <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label\">\n                    <input #newPosting\n                           (keyup.enter)=\"postNewPosting(newPosting.value); newPosting.value=''\"\n                           type=\"text\" class=\"mdl-textfield__input\">\n                    <label for=\"comment\" class=\"mdl-textfield__label\">\n                        Was bewegt Sie?\n                    </label>\n                </div>\n                <button class=\"mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon\"\n                        (click)=\"postNewPosting(newPosting.value); newPosting.value=''\">\n                    <i class=\"material-icons\" role=\"presentation\">check</i><span\n                        class=\"visuallyhidden\">add comment</span>\n                </button>\n            </form>\n        </div>\n        <div class=\"posting\" *ngFor=\"#posting of messages \">\n            <posting [posting]=\"posting\"></posting>\n        </div>\n\n    </div>\n</div>\n\n<hr>\n\n</div>\n"
        }), 
        __metadata('design:paramtypes', [router_2.Router, profile_service_1.ProfileService, router_1.RouteParams, friendsService_1.FriendsService, chat_service_1.ChatService])
    ], Profile);
    return Profile;
})();
exports.Profile = Profile;
//# sourceMappingURL=profile.js.map