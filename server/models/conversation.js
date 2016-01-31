'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const Message = require('./message');
const User = require('./user');
const mongo = require('mongodb');

const Conversation = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    },
    addMessage: function(userId, messageId, callback) {
        const self = this;
        Async.auto({
            updateConveration: [function (done, results) {
                const pushmessages = {
                    id: messageId
                };
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
               if (self.authors.indexOf({id: mongo.ObjectId(userId)})!==-1) {;
                  return self.authors
               }
               self.findByIdAndUpdate(self._id, {$push: {"authors": {id: mongo.ObjectId(userId)}}}, {
                    safe: true,
                    upsert: true,
                    new: true
                }, done);
            }
        }, (err, results) => {
            if (err) {
                return err;
            }
            return results.authorsf;
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
        timeCreated: new Date(),
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

Conversation.createWithAuthor = function (userId, callback) {
    const self = this;
    const document = {
        timeCreated: new Date(),
        messages: [],
        authors: [{
            id: mongo.ObjectId(userId)
        }]
    };
    self.insertOne(document, (err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs[0]);
    });
};

Conversation.ensureAuthor = function (conversation, userId, callback) {
    const self = this;
    Async.auto({
        authors: function (done, results) {
            const g = mongo.ObjectId(userId)
            if (conversation.authors.indexOf({id: mongo.ObjectId(userId)})!==(-1)) {
                return callback(null,conversation);
            }
            self.findByIdAndUpdate(conversation._id,{$push: {"authors": {id: mongo.ObjectId(userId)}}},{safe: true, upsert: true, new: true},done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        if (results.passwordMatch) {
            return callback(null, results.authors);
        }
        callback();
    });
};

Conversation.addAuthor = function (conversation, userId, callback) {
    const self = this;
    Async.auto({
        authors: function (done, results) {
            self.findByIdAndUpdate(conversation._id,{$push: {"authors": {id: mongo.ObjectId(userId)}}},{safe: true, upsert: true, new: true},done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.authors);
    });
};

Conversation.findAllConversationsByUserId = function (userId, callback) {
    const self = this;
    Async.auto({
        conversations: function (done) {
            const query = {
                authors: { $elemMatch:{id: mongo.ObjectId(userId)}}
            };
            self.find(query, done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.conversations);
    });
};

module.exports = Conversation;