'use strict';
const Joi = require('joi');
const Async = require('async');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;
const User = require('./user');

const Meeting = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
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

Meeting.generateTime = function(time, callback) {
    Async.auto({
        date: function (results) {
            const dateArray = birthdate.trim().split("-");
            const dateObj = new Date(dateArray[2], (dateArray[1]-1), dateArray[0],6,0,0);
            results(null, dateObj);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, results.date);
    });
};

Meeting.create = function (userid, userIds, location, time, callback) {
    const self = this;
    Async.auto({
        timeobject: this.generateBirthdate.bind(this, time),
        newMeeting: ['timeobject' , function (done, results) {
            const participants = userIds.map(function (item){return {_id: self._idClass(item)} });
            const document = {
                timeCreated: new Date(),
                time: results.timeobject,
                location: location,
                participants: [
                    {_id: self._idClass(userid)}
                ],
                unconfirmedParticipants: participants
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
                participants: { $elemMatch:{id: mongo.ObjectId(userId)}}
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