'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const Post = require('./post');
const User = require('./user');

const Comment = Post.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
});

Comment.create = function (userId, content, callback) {
    const self = this;
    Async.auto({
        newComment: function (done, results) {
            const document = {
                author: userId,
                timeCreated: new Date(),
                content: content
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