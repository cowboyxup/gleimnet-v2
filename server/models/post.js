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
                };
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

Post.findAndPopulateComments = function (query, callback) {
    const self = this;

    Async.auto({
        findById: function (results) {
            self.find(query,results);
        },
        /*pagedPosts: ['findById',(done, results) => {
            console.log(JSON.stringify(results.findById));
            var allComments = [];
            for (let i = 0; i < results.findById.length; ++i) {
                for (let j = 0; i < results.findById.length; ++j) {
                    result.push(fn(values[i]));
                }
                result.push(fn(values[i]));
            }
            return result;
            const pPosts = results.findById.map(function (item){
                console.log('itemganz:'+JSON.stringify(item));
                console.log('item:'+JSON.stringify(item.comments.map(function (item) {return self._idClass(item._id) })));
                return item.comments.map(function (item) {return self._idClass(item._id) });
            });
            console.log(JSON.stringify('dinge: '+pPosts));
            const query2 = {
                '_id': {
                    $in: pPosts
                }
            };
            Post.find(query2, done);
        }]*/
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results.findById);
    });
};

module.exports = Post;