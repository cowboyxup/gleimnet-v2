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
    addMessage: function(userId, message, callback) {
        const self = this;
        Async.auto({
            updateConveration: [function (done, results) {
                const pushmessages = {
                    _id: message._id
                };
                const pushauthor = {
                    _id: BaseModel._idClass(userId)
                };
                const query = {
                    $set: {
                        timeUpdated: message.timeCreated
                    },
                    $push: {
                        messages: {
                            $each: [pushmessages],
                            $position: 0
                        }
                    },
                    $addToSet: {
                        authors: {
                            $each: [pushauthor]
                        }
                    }
                };
                Conversation.findByIdAndUpdate(self._id,query,{safe: true, upsert: true, new: true, multi: true},done);
            }]
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.updateConveration);
        });
    }
});

Conversation._collection = 'conversations';

Conversation.schema = Joi.object().keys({
    _id: Joi.object(),
    timeCreated: Joi.date().required(),
    timeUpdated: Joi.date().required(),
    authors: Joi.array().items(Joi.object().keys({
        _id: Joi.string().length(24).hex().required()
    })).required(),
    messages: Joi.array().items(Joi.object().keys({
        _id: Joi.string().length(24).hex()
    })).required()
});

Conversation.indexes = [
    { key: { timeUpdated: 1 } }
];

Conversation.create = function (userIds, callback) {
    const self = this;
    const authors = userIds.map(function (item){return {_id: self._idClass(item)} });
    const document = {
        timeCreated: new Date(),
        timeUpdated: new Date(),
        messages: [],
        authors: authors
    };
    self.insertOne(document, (err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs[0]);
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

Conversation.findAllConversationsByUserIdAndPaged = function (userId, limit, page, callback) {
    const find = { _id: this._idClass(id) };
    const filter = { _id: this._idClass(id) };

    const self = this;
    const output = {
        _id: undefined,
        timeCreated:undefined,
        posts: undefined,
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

    Async.auto({
        findById: function (results) {
            const query = {
                authors: { $elemMatch:{_id: this._idClass(userId)}}
            };
            self.find(query, results);
        },
        pagedPosts: ['findById',(done, results) => {
            const pPosts = results.findById.posts.slice((output.items.begin-1),output.items.end).map(function (item){return self._idClass(item._id) });
            const query = {
                '_id': {
                    $in: pPosts
                }
            };
            Post.findAndPopulateComments(query,done);
        }]
    }, (err, results) => {

        if (err) {
            return callback(err);
        }
        output._id = results.findById._id;
        output.timeCreated = results.findById.timeCreated;

        output.posts = results.pagedPosts;
        output.items.total = results.findById.posts.length;

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

module.exports = Conversation;