'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const User = require('./user');

const Comment = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
});

Comment._collection = 'comments';

Comment.schema = Joi.object().keys({
    _id: Joi.object(),
    author: Joi.string().length(24).hex().required(),
    timeCreated: Joi.date().required(),
    content: Joi.string().required(),
});

Comment.indexes = [
];

Comment.create = function (userId, content, callback) {
    const self = this;
    Async.auto({
        newComment: function (done, results) {
            const document = {
                author: userId,
                timeCreated: new Date(),
                content: content,
            };
            self.insertOne(document, (done));
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.newComment[0]);
    });
};

module.exports = Comment;