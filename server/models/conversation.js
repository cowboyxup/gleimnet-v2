'use strict';
const Joi = require('joi');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const Message = require('./message');
const User = require('./user');

const Conversation = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
});

Conversation._collection = 'conversations';

Conversation.schema = Joi.object().keys({
    _id: Joi.object(),
    auhors: Joi.array().items(Joi.object().keys({
        id: Joi.string().length(24).hex().required()
    })).required(),
    messages: Joi.array().items(Joi.object().keys({
        id: Joi.string().length(24).hex()
    })).required()
});

Conversation.indexes = [
];

Conversation.create = function (authorname, callback) {
    const self = this;
    const document = {
        messages: [],
        authors: []
    };
    self.insertOne(document, (err, docs) => {
        if (err) {
            return callback(err);
        }
        //this.ensureAuthor(authorname, callback)
        callback(null, docs[0]);
    });
};

Conversation.ensureAuthor = function (username, callback) {
    Async.auto({
        user: function (done) {
            const query = {
                isActive: true
            };
            query.username = username.toLowerCase();
            User.findOne(query, done);
        },
        authorsf: ['user', function (done, results) {
            if (!results.user) {
                return done(null, false);
            }
            if (this.authors.contains({id: results.user._id})) {
                return this.authors
            }
            self.findByIdAndUpdate(this._id,{$push: {"authors": {id: results.user._id}}},{safe: true, upsert: true, new: true},done);
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
}

Conversation.addMessage = function (username, messageId, callback) {
    const self = this;
    Async.auto({
        findMessage: (results) => {
            Message.findById.bind(Message, messageId, results);
        },
        ensureAuthor: this.ensureAuthor.bind(this, username),
        updateConveration: ['findMessage','ensureAuthor', function (done, results) {
            self.findByIdAndUpdate(this._id,{$push: {"messages": {id: results.findMessage._id}}},{safe: true, upsert: true, new: true},done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results.updateConveration[0]);
    });

    const item = {
        title: 'title of the new item',
        price: '4242'
    };
};




module.exports = Conversation;
