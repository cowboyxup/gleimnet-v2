'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const User = require('./user');

const Meeting = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    },
    confirm: function(userId, callback) {
        const self = this;
        Async.auto({
            updateMeeting: [function (done, results) {
                const pushauthor = {
                    _id: BaseModel._idClass(userId)
                };
                const query = {
                    $pull: {
                        unconfirmedParticipants: pushauthor
                    }
                };
                Meeting.findByIdAndUpdate(self._id,query,{safe: true, upsert: true, new: true, multi: true},done);
            }]
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.updateMeeting);
        });
    }
});

Meeting._collection = 'meetings';

Meeting.schema = Joi.object().keys({
    _id: Joi.object(),
    timeCreated: Joi.date().required(),
    time: Joi.date().required(),
    location: Joi.string().required(),
    participants: Joi.array().items(Joi.object().keys({
        _id: Joi.string().length(24).hex().required()
    })).required(),
    unconfirmedParticipants: Joi.array().items(Joi.object().keys({
        _id: Joi.string().length(24).hex()
    })).required()
});

Meeting.indexes = [
    { key: { time: 1 } }
];

Meeting.create = function (userid, userIds, location, time, callback) {
    const self = this;
    Async.auto({
        newMeeting: [function (done, results) {
            const participants = userIds.map(function (item){return {_id: self._idClass(item._id)} });
            function filterOwn(obj) {
                if (obj._id.toString() === userid) {
                    return false;
                } else {
                    return true;
                }
            }
            const unconfirmedParticipants = participants.filter(filterOwn)
            const document = {
                timeCreated: new Date(),
                time: new Date(time),
                location: location,
                participants: participants,
                unconfirmedParticipants: unconfirmedParticipants
            };
            self.insertOne(document, done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.newMeeting[0]);
    });
};

Meeting.findAllMeetingsByUserId = function (userId, callback) {
    const self = this;
    Async.auto({
        conversations: function (done) {
            const query = {
                participants: { $elemMatch:{_id: mongo.ObjectId(userId)}}
            };
            self.find(query, done);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.conversations);
    });
};
module.exports = Meeting;