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
    addComment: function(commentId, callback) {
        const self = this;
        Async.auto({
            updatePost: function (done) {
                const pushcomment = {
                    _id: BaseModel._idClass(commentId)
                };
                Post.findByIdAndUpdate(self._id,{$push: {comments: {$each: [pushcomment],$position: 0}}},{safe: true, upsert: true, new: true},done);
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            return callback(null, results.updatePost);
        });
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
                Post.findByIdAndUpdate(self._id,query,{safe: true, upsert: true, new: true, multi: true},done);
            }]
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.updatePost);
        });
    }
});

Post._collection = 'posts';

Post.schema = Joi.object().keys({
    _id: Joi.object(),
    author: Joi.string().length(24).hex().required(),
    timeCreated: Joi.date().required(),
    content: Joi.string().required(),
    comments: Joi.array().items(Joi.object().keys({
        _id: Joi.string().length(24).hex().required()
    })),
    likes: Joi.array().items(Joi.object().keys({
        _id: Joi.string().length(24).hex().required()
    }))
});

Post.indexes = [
];

Post.create = function (userId, content, callback) {
    const self = this;
    Async.auto({
        newPost: function (done, results) {
            const document = {
                author: self._idClass(userId),
                timeCreated: new Date(),
                content: content,
                comments: [],
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

Post.findAndPopulateComments = function (query, callback) {
    const self = this;

    Async.auto({
        findById: function (results) {
            self.find(query,results);
        },
        comments: ['findById',(done, results) => {
            // special map function
            let allComments = [];
            for (let i = 0; i < results.findById.length; ++i) {
                for (let j = 0; j < results.findById[i].comments.length; ++j) {
                    allComments.push(self._idClass(results.findById[i].comments[j]._id));
                }
            }
            const queryComments = {
                '_id': {
                    $in: allComments
                }
            };
            Post.find(queryComments, done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        let tempPost = results.findById;
        for (let i = 0; i < tempPost.length; ++i) {
            for (let j = 0; j < tempPost[i].comments.length; ++j) {
                let comment = results.comments.shift();
                comment.comments = undefined;
                tempPost[i].comments[j] = comment;
            }
        }
        callback(null, tempPost);
    });
};

module.exports = Post;