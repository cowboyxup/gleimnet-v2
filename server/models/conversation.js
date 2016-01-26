'use strict';
const Joi = require('joi');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;

const Conversation = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
});

Conversation._collection = 'conversations';

Conversation.schema = Joi.object().keys({
    _id: Joi.object(),
    auhors: Joi.object().keys({
        id: Joi.string().length(24).hex().required()
    }),
    messages: Joi.object().keys({
        id: Joi.string().length(24).hex().required()
    })
});

Conversation.indexes = [
];

Conversation.create = function (conversations, callback) {
    const self = this;
    this.insertOne(self, (err, docs) => {
        if (err) {
            return callback(err);
        }
        callback(null, docs[0]);
    });
};

module.exports = Conversation;
