'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const Post = require('./post');
const mongo = require('mongodb');

const Timeline = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    },
    addPost: function(postId, callback) {
        const self = this;
        Async.auto({
            updateTimeline: function (done) {
                const pushPost = {
                    _id: BaseModel._idClass(postId)
                };
                Timeline.findByIdAndUpdate(self._id,{$push: {posts: {$each: [pushPost],$position: 0}}},{safe: true, upsert: true, new: true},done);
            }
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            return callback(null, results.updateTimeline);
        });
    }
});

Timeline._collection = 'timelines';

Timeline.schema = Joi.object().keys({
    _id: Joi.object(),
    timeCreated: Joi.date().required(),
    posts: Joi.array().items(Joi.object().keys({
        id: Joi.string().length(24).hex()
    })).required()
});

Timeline.indexes = [
];

Timeline.create = function (callback) {
    const self = this;
    const document = {
        timeCreated: new Date(),
        posts: []
    };
    self.insertOne(document, (err, docs) => {
        if (err) {
            return callback(err);
        }
        return callback(null, docs[0]);
    });
};

Timeline.findByIdAndPaged = function (id, limit, page, callback) {
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
            self.findById(id,results);
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

module.exports = Timeline;