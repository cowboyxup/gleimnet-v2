'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const Message = require('./message');
const User = require('./user');

const Conversation = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    },
    addMessage: function(userId, messageId, callback) {
        const self = this;
        Async.auto({
            ensureAuthord: (results) => {
                self.ensureAuthor(userId, results);
            },
            updateConveration: ['ensureAuthord', function (done, results) {
                const pushmessages = {
                    id: messageId
                }
                Conversation.findByIdAndUpdate(self._id,{$push: {messages: {$each: [pushmessages],$position: 0}}},{safe: true, upsert: true, new: true},done);
            }]
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.updateConveration);
        });
    },
    ensureAuthor: function (userId, callback) {
        const self = this;
        Async.auto({
            authorsf: function (done, results) {
                if (!results.user) {
                    return done(null, false);
                }
                if (self.authors.contains({id: userId})) {
                    return self.authors
                }
                self.findByIdAndUpdate(self._id, {$push: {"authors": {id: userId}}}, {
                    safe: true,
                    upsert: true,
                    new: true
                }, done);
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.authorsf);
        })
    }

});

Conversation._collection = 'conversations';

Conversation.schema = Joi.object().keys({
    _id: Joi.object(),
    timeCreated: Joi.date().required(),
    auhors: Joi.array().items(Joi.object().keys({
        id: Joi.string().length(24).hex().required()
    })).required(),
    messages: Joi.array().items(Joi.object().keys({
        id: Joi.string().length(24).hex()
    })).required()
});

Conversation.indexes = [
];

Conversation.create = function (callback) {
    const self = this;
    const document = {
        messages: [],
        authors: []
    };
    self.insertOne(document, (err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs[0]);
    });
};

Conversation.ensureAuthor = function (userId, callback) {
    const self = this;
    Async.auto({
        user: function (done) {
            /*const query = {
                isActive: true
            };
            query.username = username.toLowerCase();*/
            User.findById(userId,done);
            //User.findOne(query, done);
        },
        authorsf: ['user', function (done, results) {
            if (!results.user) {
                return done(null, false);
            }
            if (this.authors.contains({id: results.user._id})) {
                return this.authors
            }
            self.findByIdAndUpdate(this._id,{$push: {"authors": {id: results.user._id.toString()}}},{safe: true, upsert: true, new: true},done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        if (results.passwordMatch) {
            return callback(null, results.authorsf);
        }
        callback();
    });
};
module.exports = Conversation;