'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const User = require('./user');

const Message = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
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
