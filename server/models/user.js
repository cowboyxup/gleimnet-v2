'use strict';

const Joi = require('joi');
const Async = require('async');
const Bcrypt = require('bcryptjs');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const Timeline = require('./timeline');

const User = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    },
    addSentFriend: function(userId, callback) {
        const self = this;
        Async.auto({
            updateUser: function (done) {
                const sentFriend = {
                    _id: BaseModel._idClass(userId)
                };
                User.findByIdAndUpdate(self._id,{$push: {sentFriends: {$each: [sentFriend],$position: 0}}},{safe: true, upsert: true, new: true},done);
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            return callback(null, results.updateUser);
        });
    },
    addUnconfirmedFriend: function(userId, callback) {
        const self = this;
        Async.auto({
            updateUser: function (done) {
                const unconfirmedFriend = {
                    _id: BaseModel._idClass(userId)
                };
                User.findByIdAndUpdate(self._id,{$push: {unconfirmedFriends: {$each: [unconfirmedFriend],$position: 0}}},{safe: true, upsert: true, new: true},done);
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            return callback(null, results.updateUser);
        });
    },
    addFriend: function(userId, callback) {
        const self = this;
        Async.auto({
            updateUser: function (done) {
                const friend = {
                    _id: BaseModel._idClass(userId)
                };
                User.findByIdAndUpdate(self._id,{$push: {friends: {$each: [friend],$position: 0}},$pull: {unconfirmedFriends: friend, sentFriends: friend}},{safe: true, upsert: true, new: true, multi: true},done);
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            return callback(null, results.updateUser);
        });
    },
    removeFriend: function(userId, callback) {
        const self = this;
        Async.auto({
            updateUser: function (done) {
                const friend = {
                    _id: BaseModel._idClass(userId)
                };
                User.findByIdAndUpdate(self._id,{$pull: {unconfirmedFriends: friend, sentFriends: friend, friends: friend}},{safe: true, upsert: true, new: true, multi: true},done);
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            return callback(null, results.updateUser);
        });
    }
});

User._collection = 'users';

User.schema = Joi.object().keys({
    _id: Joi.object(),
    timeCreated: Joi.date().required(),
    isActive: Joi.boolean().default(true),
    username: Joi.string().token().lowercase().required(),
    password: Joi.string().required(),

    givenName: Joi.string().required(),
    surname: Joi.string().required(),
    nickname: Joi.string().required(),
    birthdate: Joi.date().required(),
    description: Joi.string().allow('').required(),
    avatar: Joi.string().required(),
    titlePicture: Joi.string().required(),
    tags: Joi.array().max(5).items(
        Joi.string().required()
    ).required(),
    birthplace: Joi.string().required(),
    influenceplace: Joi.string().required(),
    timeline: Joi.object().keys({
        id: Joi.string().length(24).hex().required()
    }),
    friends: Joi.array().items(Joi.object().keys({
        _id: Joi.string().length(24).hex()
    })).required(),
    unconfirmedFriends: Joi.array().items(Joi.object().keys({
        _id: Joi.string().length(24).hex()
    })).required(),
    sentFriends: Joi.array().items(Joi.object().keys({
        _id: Joi.string().length(24).hex()
    })).required()
});

User.indexes = [
    { key: { username: 1, unique: true } }
];

User.generatePasswordHash = function (password, callback) {
    Async.auto({
        salt: function (done) {
            Bcrypt.genSalt(10, done);
        },
        hash: ['salt', function (done, results) {
            Bcrypt.hash(password, results.salt, done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, {
            password: password,
            hash: results.hash
        });
    });
};

User.generateBirthdate = function(birthdate, callback) {
    Async.auto({
        date: function (results) {
            let dateObj;
            if (birthdate === null ||birthdate === '') {
                dateObj = null;
            }
            else {
                const dateArray = birthdate.trim().split("-");
                dateObj = new Date(dateArray[2], (dateArray[1]-1), dateArray[0],6,0,0);
            }
            results(null, dateObj);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.date);
    });
};

User.create = function (username, password, givenName, surename, nickname, birthdate, description, avatar, titlePicture, tags, birthplace, influenceplace, callback) {
    const self = this;
    Async.auto({
        createTimeline: (results) => {
            Timeline.create(results);
        },
        passwordHash: this.generatePasswordHash.bind(this, password),
        birth: this.generateBirthdate.bind(this, birthdate),
        newUser: ['passwordHash','birth','createTimeline', function (done, results) {
            const document = {
                timeCreated: new Date(),
                isActive: true,
                username: username.toLowerCase(),
                password: results.passwordHash.hash,
                givenName: givenName,
                surname: surename,
                nickname: nickname,
                birthdate: results.birth,
                description: description,
                avatar: avatar,
                titlePicture: titlePicture,
                tags: tags,
                birthplace: birthplace,
                influenceplace: influenceplace,
                timeline: results.createTimeline._id,
                friends: [],
                unconfirmedFriends:[],
                sentFriends:[]
            };
            self.insertOne(document, done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        results.newUser[0].password = results.passwordHash.password;
        return callback(null, results.newUser[0]);
    });
};

User.findByCredentials = function (username, password, callback) {
    const self = this;
    Async.auto({
        user: function (done) {
            const query = {
                isActive: true
            };
            query.username = username.toLowerCase();
            self.findOne(query, done);
        },
        passwordMatch: ['user', function (done, results) {
            if (!results.user) {
                return done(null, false);
            }
            const source = results.user.password;
            Bcrypt.compare(password, source, done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        if (results.passwordMatch) {
            return callback(null, results.user);
        }
        return callback();
    });
};


User.findByUsername = function (username, callback) {
    const self = this;
    const query = {username: username.toLowerCase() };
    self.findOne(query, callback);
};
User.findProfileById = function (id, callback) {
    const self = this;
    const query = { _id: this._idClass(id) };

    self.findOne(query, (err, user) => {
        if(err) {
            return callback(err);
        }
        if(!user) {
            return callback(null,null);
        }
        const profile = {
            _id: user._id,
            timeCreated: user.timeCreated,
            username: user.username,
            givenName: user.givenName,
            surname: user.surname,
            nickname: user.nickname,
            birthdate: user.birthdate,
            description: user.description,
            avatar: user.avatar,
            titlePicture: user.titlePicture,
            tags: user.tags,
            birthplace: user.birthplace,
            influenceplace: user.influenceplace,
            timeline: user.timeline,
            friends: user.friends
        };
        return callback(null, profile)
    });
};

User.findProfileByIdAndUpdate = function (id, updates, callback) {
    const self = this;
    self.findByIdAndUpdate(id, {$set: updates}, {returnOriginal: false}, (err, user) => {
        if(err) {
            return callback(err);
        }
        if(!user) {
            return callback(null,null);
        }
        const profile = {
            _id: user._id,
            timeCreated: user.timeCreated,
            username: user.username,
            givenName: user.givenName,
            surname: user.surename,
            nickname: user.nickname,
            birthdate: user.birthdate,
            description: user.description,
            avatar: user.avatar,
            titlePicture: user.titlePicture,
            tags: user.tags,
            birthplace: user.birthplace,
            influenceplace: user.influenceplace,
            timeline: user.timeline,
            friends: user.friends
        };
        return callback(null, profile)
    });
};
User.pagedFind = function (filter, fields, sort, limit, page, callback) {

    const self = this;
    const output = {
        data: undefined,
        pages: {
            current: page,
            prev: 0,
            hasPrev: false,
            next: 0,
            hasNext: false,
            total: 0
        },
        items: {
            limit: limit,
            begin: ((page * limit) - limit) + 1,
            end: page * limit,
            total: 0
        }
    };

    fields = this.fieldsAdapter(fields);
    sort = this.sortAdapter(sort);

    Async.auto({
        count: function (done) {

            self.count(filter, done);
        },
        find: function (done) {

            const options = {
                limit: limit,
                skip: (page - 1) * limit,
                sort: sort
            };

            self.find(filter, fields, options, done);
        }
    }, (err, results) => {

        if (err) {
            return callback(err);
        }
        let items = results.find;
        for (let i = 0; i < items.length; ++i) {
            if(items[i].password) {
                items[i].password = undefined;
            }
            if(items[i].unconfirmedFriends) {
                items[i].unconfirmedFriends = undefined;
            }
            if(items[i].sentFriends) {
                items[i].sentFriends = undefined;
            }
            if(items[i].isActive) {
                items[i].isActive = undefined;
            }
        }

        output.data = items;
        output.items.total = results.count;

        // paging calculations
        output.pages.total = Math.ceil(output.items.total / limit);
        output.pages.next = output.pages.current + 1;
        output.pages.hasNext = output.pages.next <= output.pages.total;
        output.pages.prev = output.pages.current - 1;
        output.pages.hasPrev = output.pages.prev !== 0;
        if (output.items.begin > output.items.total) {
            output.items.begin = output.items.total;
        }
        if (output.items.end > output.items.total) {
            output.items.end = output.items.total;
        }

        callback(null, output);
    });
};


module.exports = User;