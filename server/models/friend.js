'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;

const Friend = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
});

Friend._collection = 'friends';

Friend.schema = Joi.object().keys({
    _id: Joi.object(),
    isActive: Joi.boolean().default(false),
    users: Joi.object().keys({
        id: Joi.string().length(24).hex().required()
    })
});

Friend.indexes = [
];

Friend.create = function (friends, callback) {
    const self = this;
    this.insertOne(self, (err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs[0]);
    });
};

Friend.findByUserId = function (userId, callback) {
    const self = this;
    Async.auto({
        friends: function (done) {
            const query = {
                users: [{id: userId}]
            };
            self.findOne(query, done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        if(!results.friends) {
            return callback(null, []);
        }
        return callback(null, results.friends);
    });
};

module.exports = Friend;
