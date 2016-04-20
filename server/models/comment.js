'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const User = require('./user');

const Comment = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    },
    addLike: function(userId, callback) {
        const self = this;
        Async.auto({
            updatePost: [function (done, results) {
                const pushauthor = {
                    _id: BaseModel._idClass(userId)
                };
                const query = {
                    $addToSet: {
                        likes: {
                            $each: [pushauthor]
                        }
                    }
                };
                Comment.findByIdAndUpdate(self._id,query,{safe: true, upsert: true, new: true, multi: true},done);
            }]
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.updatePost);
        });
    }
});

Comment._collection = 'comments';

Comment.schema = Joi.object().keys({
    _id: Joi.object(),
    author: Joi.string().length(24).hex().required(),
    timeCreated: Joi.date().required(),
    content: Joi.string().required(),
    likes: Joi.array().items(Joi.object().keys({
        _id: Joi.string().length(24).hex().required()
    }))
});

Comment.indexes = [
];

Comment.create = function (userId, content, callback) {
    const self = this;
    Async.auto({
        newPost: function (done, results) {
            const document = {
                author: self._idClass(userId),
                timeCreated: new Date(),
                content: content,
                likes: []
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

module.exports = Comment;