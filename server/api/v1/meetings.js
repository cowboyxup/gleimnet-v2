'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');


const internals = {};


internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    const Meeting = server.plugins['hapi-mongo-models'].Meeting;

    server.route([{
        method: 'GET',
        path: '/meetings',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            },
            validate: {
                query: {
                    sort: Joi.string().default('-time'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [{
                assign: 'meetings',
                method: function(request, reply) {
                    const query = {
                        participants: { $elemMatch:{_id: Meeting._idClass(request.auth.credentials._id)}}
                    };
                    const fields = '';
                    const sort = request.query.sort;
                    const limit = request.query.limit;
                    const page = request.query.page;

                    Meeting.pagedFind(query, fields, sort, limit, page, (err, meetings) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!meetings) {
                            return reply(Boom.notFound('Document not found.'));
                        }
                        return reply(meetings);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            return reply(request.pre.meetings);
        }
    }]);
    server.route([{
        method: 'GET',
        path: '/meeting/{_id}',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            },
            validate: {
                params: {
                    _id: Joi.string().length(24).hex().required()
                }
            },
            pre: [{
                assign: 'meeting',
                method: function(request, reply) {
                    Meeting.findById(request.params._id, (err, meeting) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!meeting) {
                            return reply(Boom.notFound('Document not found.'));
                        }
                        reply(meeting);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            reply (request.pre.meeting);
        }
    }]);
    server.route([{
        method: 'POST',
        path: '/meetings/{_id}',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            },
            validate: {
                params: {
                    _id: Joi.string().length(24).hex().required()
                },
                payload: {
                    confirm: Joi.boolean().required()
                }
            },
            pre: [{
                assign: 'conversation',
                method: function(request, reply) {
                    Meeting.findById(request.params._id, (err, meeting) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!meeting) {
                            return reply(Boom.notFound('Conversation not found.'));
                        }
                        return reply(meeting);
                    });
                }
            }
            ]
        },
        handler: function (request, reply) {
            request.pre.meeting.confirm(request.auth.credentials._id, (err, meeting) => {
                if (err) {
                    return reply(err);
                }
                return reply(meeting);
            });
        }
    }]);
    server.route([{
        method: 'POST',
        path: '/meeting',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            },
            validate: {
                payload: {
                    participants: Joi.array().items(Joi.object().keys({
                            _id: Joi.string().length(24).hex().required()
                        })).required(),
                    location: Joi.string().required(),
                    time: Joi.date().required()
                }
            },
            pre: [{
                assign: 'users',
                method: function (request, reply) {
                    let participants = request.payload.participants.map(function (item){
                        return User._idClass(item._id)});
                    participants.push(User._idClass(request.auth.credentials._id));
                    const query = {
                        '_id': {
                            $in: participants
                        }
                    };
                    User.find(query, (err, users) => {
                        if (err) {
                            return reply(err);
                        }
                        //console.log(JSON.stringify(users, null, '\t'))
                        if (users.length === 0) {
                            return reply(Boom.notFound('One or more Users not found.'));
                        }
                        return reply(users);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            Meeting.create(request.auth.credentials._id, request.pre.users, request.payload.location, request.payload.time, (err, conversation) => {
                return reply(conversation);
            });
        }
    }]);
    next();
};

exports.register = function (server, options, next) {
    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);
    next();
};


exports.register.attributes = {
    name: 'meetings'
};