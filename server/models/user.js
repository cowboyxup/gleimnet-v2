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
    description: Joi.string(),
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
    { key: { username: 1, unique: true } },
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
            const dateArray = birthdate.trim().split("-");
            const dateObj = new Date(dateArray[2], (dateArray[1]-1), dateArray[0],6,0,0);
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
    const query = {username: username.toLowerCase() };
    this.findOne(query, callback);
};
User.findProfileById = function (id, callback) {
    const query = { _id: this._idClass(id) };
    this.findOne(query, (err, user) => {
        if(err) {
            return callback(err);
        }
        if(!user) {
            return callback(null,null);
        }
        console.log('err: '+JSON.stringify(err));
        console.log('user: '+JSON.stringify(user));
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

module.exports = User;