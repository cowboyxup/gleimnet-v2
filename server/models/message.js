'use strict';
const Joi = require('joi');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;

const Message = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
});

Message._collection = 'messages';

Message.schema = Joi.object().keys({
    _id: Joi.object(),
    author: Joi.string().length(24).hex().required(),
    content: Joi.string().required(),
    comments: Joi.object().keys({
        id: Joi.string().length(24).hex().required()
    })
});

Message.indexes = [
];

Message.create = function (messages, callback) {
    const self = this;
    this.insertOne(self, (err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs[0]);
    });
};

module.exports = Message;
