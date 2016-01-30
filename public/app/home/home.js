System.register(['angular2/core', "./profile.service"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, profile_service_1;
    var Home;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (profile_service_1_1) {
                profile_service_1 = profile_service_1_1;
            }],
        execute: function() {
            Home = (function () {
                function Home(_profileService) {
                    this._profileService = _profileService;
                    this.user = new profile_service_1.User();
                    this.isMe = true;
                    this.username = localStorage.getItem('username');
                }
                Home.prototype.ngOnInit = function () {
                    var basicAuth = localStorage.getItem('AuthKey');
                    if (basicAuth) {
                        this.loadProfilInfos();
                        this.loadTimeline();
                    }
                };
                Home.prototype.loadProfilInfos = function () {
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
                Home.prototype.loadTimeline = function () {
                    var _this = this;
                    if (this.username) {
                        this._profileService.loadTimeline(this.username)
                            .subscribe(function (res) { _this.messages = res.messages; }, function (error) { console.log(error.message); });
                    }
                };
                Home.prototype.postNewPosting = function (content) {
                    var _this = this;
                    if (this.username) {
                        this._profileService.postNewPosting(this.username, content)
                            .subscribe(function (response) {
                            _this.loadTimeline();
                        }, function (error) { console.log(error.message); });
                    }
                };
                Home.prototype.commentOnPosting = function (content, postId) {
                    var _this = this;
                    if (this.username) {
                        this._profileService.commentOnPosting(content, postId)
                            .subscribe(function (response) {
                            _this.loadTimeline();
                        }, function (error) { console.log(error.message); });
                    }
                };
                Home = __decorate([
                    core_1.Component({
                        selector: 'Home',
                        templateUrl: './app/home/home.html',
                        providers: [profile_service_1.ProfileService]
                    }), 
                    __metadata('design:paramtypes', [profile_service_1.ProfileService])
                ], Home);
                return Home;
            })();
            exports_1("Home", Home);
        }
    }
});
//# sourceMappingURL=home.js.map