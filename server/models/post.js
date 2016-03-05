'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const User = require('./user');

const Post = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    },
    addComment: function(userId, commentId, callback) {
        const self = this;
        Async.auto({
            updatePost: function (results) {
                const pushcomment = {
                    _id: postId
                }
                Post.findByIdAndUpdate(self._id,{$push: {comments: {$each: [pushcomment],$position: 0}}},{safe: true, upsert: true, new: true},results);
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            return callback(null, results.updatePost);
        });
    }
});

Post._collection = 'posts';

Post.schema = Joi.object().keys({
    _id: Joi.object(),
    author: Joi.string().length(24).hex().required(),
    timeCreated: Joi.date().required(),
    content: Joi.string().required(),
    comments: Joi.object().keys({
        id: Joi.string().length(24).hex().required()
    })
});

Post.indexes = [
];

Post.create = function (userId, content, callback) {
    const self = this;
    Async.auto({
        newPost: function (done, results) {
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
        return callback(null, results.newPost[0]);
    });
};

module.exports = Post;