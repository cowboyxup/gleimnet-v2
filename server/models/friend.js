'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;

const Friend = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
});

Friend._collection = 'friends';

Friend.schema = Joi.object().keys({
    _id: Joi.object(),
    isActive: Joi.boolean().default(false),
    users: Joi.array().items(Joi.object().keys({
        id: Joi.string().length(24).hex()
    })).required()
});

Friend.indexes = [
];

Friend.create = function (ownUserId, userId, callback) {
    const self = this;
    const User = require('./user');
    Async.auto({
        ownUser: function (done) {
            User.findById(ownUserId,done);
        },
        user: function (done) {
            User.findById(userId,done);
        },
        friends: ['ownUser','user', function (done, results) {
            const document = {
                isActive: false,
                friends: [
                    {id: results.ownUser._id.toString()},
                    {id: results.user._id.toString()}
                ]
            };
            self.insertOne(document, done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        if (results.passwordMatch) {
            return callback(null, results.friends);
        }
        callback();
    });
};

Friend.findActiveByUserId = function (userId, callback) {
    const self = this;
    Async.auto({
        friends: function (done) {
            const query = {
                isActive: true,
                friends: { $elemMatch: { id: userId }}
            };
            self.find(query, done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.friends);
    });
};

Friend.findConfirmedByUserId = function (userId, callback) {
    const self = this;
    Async.auto({
        friends: function (done) {
            const query = {
                isActive: true,
                friends: { $elemMatch: { id: userId }}
            };
            self.find(query, done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.friends);
    });
};
Friend.findUnconfirmedByUserId = function (userId, callback) {
    const self = this;
    Async.auto({
        friends: function (done) {
            const query = {
                isActive: false,
                friends: { $elemMatch: { id: userId }}
            };
            self.find(query, done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.friends);
    });
};
Friend.findByUserId = function (userId, callback) {
    const self = this;
    Async.auto({
        friends: function (done) {
            const query = {
                friends: { $elemMatch: { id: userId }}
            };
            self.find(query, done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.friends);
    });
};

module.exports = Friend;
