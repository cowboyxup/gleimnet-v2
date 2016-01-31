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
                console.log('ddddddd');
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
                console.log(userId);
               if (self.authors.indexOf({id: mongo.ObjectId(userId)})!==-1) {
                   console.log("dinge");
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
            console.log(conversation.authors.map(function(e) { return e.id; }));
            if (conversation.authors.indexOf({id: mongo.ObjectId(userId)})!==(-1)) {
                console.log('d');
                return callback(null,conversation);
            }
            console.log(JSON.stringify(conversation));
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

Conversation.findAllConversationsByUserId = function (userId, callback) {
    const self = this;
    Async.auto({
        conversations: function (done) {
            console.log(userId);
            const query = {
                authors: { $elemMatch:{id: mongo.ObjectId(userId)}}
            };
            self.find(query, done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        console.log(results);

        return callback(null, results.conversations);
    });
};

module.exports = Conversation;