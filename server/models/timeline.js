'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const Post = require('./post');
const User = require('./user');
const mongo = require('mongodb');

const Timeline = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    },
    addTimeline: function(userId, messageId, callback) {
        const self = this;
        Async.auto({
            updateConveration: [function (done, results) {
                const pushmessages = {
                    id: messageId
                };
                Timeline.findByIdAndUpdate(self._id,{$push: {messages: {$each: [pushmessages],$position: 0}}},{safe: true, upsert: true, new: true},done);
            }]
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.updateConveration);
        });
    },
    ensureAuthor: function (userId, callback) {
        const self = this;
        Async.auto({
            authorsf: function (done, results) {
                if (self.authors.indexOf({id: mongo.ObjectId(userId)})!==-1) {;
                    return self.authors
                }
                self.findByIdAndUpdate(self._id, {$push: {"authors": {id: mongo.ObjectId(userId)}}}, {
                    safe: true,
                    upsert: true,
                    new: true
                }, done);
            }
        }, (err, results) => {
            if (err) {
                return err;
            }
            return results.authorsf;
        })
    }

});

Timeline._collection = 'timelines';

Timeline.schema = Joi.object().keys({
    _id: Joi.object(),
    timeCreated: Joi.date().required(),
    auhors: Joi.array().items(Joi.object().keys({
        id: Joi.string().length(24).hex().required()
    })).required(),
    messages: Joi.array().items(Joi.object().keys({
        id: Joi.string().length(24).hex()
    })).required()
});

Timeline.indexes = [
];

Timeline.create = function (callback) {
    const self = this;
    const document = {
        timeCreated: new Date(),
        messages: [],
        authors: []
    };
    self.insertOne(document, (err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs[0]);
    });
};

Timeline.createWithAuthor = function (userId, callback) {
    const self = this;
    const document = {
        timeCreated: new Date(),
        messages: [],
        authors: [{
            id: mongo.ObjectId(userId)
        }]
    };
    self.insertOne(document, (err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs[0]);
    });
};

Timeline.ensureAuthor = function (Timeline, userId, callback) {
    const self = this;
    Async.auto({
        authors: function (done, results) {
            const g = mongo.ObjectId(userId)
            if (Timeline.authors.indexOf({id: mongo.ObjectId(userId)})!==(-1)) {
                return callback(null,Timeline);
            }
            self.findByIdAndUpdate(Timeline._id,{$push: {"authors": {id: mongo.ObjectId(userId)}}},{safe: true, upsert: true, new: true},done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        if (results.passwordMatch) {
            return callback(null, results.authors);
        }
        callback();
    });
};

Timeline.addAuthor = function (Timeline, userId, callback) {
    const self = this;
    Async.auto({
        authors: function (done, results) {
            self.findByIdAndUpdate(Timeline._id,{$push: {"authors": {id: mongo.ObjectId(userId)}}},{safe: true, upsert: true, new: true},done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.authors);
    });
};

Timeline.findAllTimelinesByUserId = function (userId, callback) {
    const self = this;
    Async.auto({
        Timelines: function (done) {
            const query = {
                authors: { $elemMatch:{id: mongo.ObjectId(userId)}}
            };
            self.find(query, done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.Timelines);
    });
};

module.exports = Timeline;