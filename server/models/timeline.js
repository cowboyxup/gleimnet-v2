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
        messages: []
    };
    self.insertOne(document, (err, docs) => {
        if (err) {
            return callback(err);
        }
        return callback(null, docs[0]);
    });
};

module.exports = Timeline;