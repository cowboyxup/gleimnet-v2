'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const User = require('./user');

const Message = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    },
    addComment: function(userId, messageId, callback) {
        const self = this;
        Async.auto({
            updateMessage: function (results) {
                const pushcomment = {
                    id: messageId
                }
                Message.findByIdAndUpdate(self._id,{$push: {comments: {$each: [pushcomment],$position: 0}}},{safe: true, upsert: true, new: true},results);
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.updateMessage);
        });
    },
});

Message._collection = 'messages';

Message.schema = Joi.object().keys({
    _id: Joi.object(),
    author: Joi.string().length(24).hex().required(),
    timeCreated: Joi.date().required(),
    content: Joi.string().required(),
    comments: Joi.object().keys({
        id: Joi.string().length(24).hex().required()
    })
});

Message.indexes = [
];

Message.create = function (userId, content, callback) {
    const self = this;
    Async.auto({
        newMessage: function (done, results) {
            const document = {
                author: userId,
                timeCreated: new Date(),
                content: content,
                comments: []
            };
            self.insertOne(document, (done));
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results.newMessage[0]);
    });
};

module.exports = Message;
