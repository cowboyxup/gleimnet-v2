'use strict';
const Joi = require('joi');
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

module.exports = Friend;
