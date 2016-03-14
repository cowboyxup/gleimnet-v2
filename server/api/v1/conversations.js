'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');


const internals = {};


internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    const Conversation = server.plugins['hapi-mongo-models'].Conversation;
    const Message = server.plugins['hapi-mongo-models'].Message;

    server.route([{
        method: 'GET',
        path: '/conversations',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            },
            validate: {
                query: {
                    sort: Joi.string().default('-timeUpdated'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [{
                assign: 'conversations',
                method: function(request, reply) {
                    const query = {
                        authors: { $elemMatch:{_id: Conversation._idClass(request.auth.credentials._id)}}
                    };
                    const fields = '_id authors timeCreated timeUpdated';
                    const sort = request.query.sort;
                    const limit = request.query.limit;
                    const page = request.query.page;

                    Conversation.pagedFind(query, fields, sort, limit, page, (err, conversations) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!conversations) {
                            return reply(Boom.notFound('Document not found.'));
                        }
                        return reply(conversations);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            return reply(request.pre.conversations);
        }
    }]);
    server.route([{
        method: 'GET',
        path: '/conversations/{_id}',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            },
            validate: {
                params: {
                    _id: Joi.string().length(24).hex().required()
                },
                query: {
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [{
                assign: 'conversation',
                method: function(request, reply) {
                    const limit = request.query.limit;
                    const page = request.query.page;
                    Conversation.findByIdAndPaged(request.params._id, limit, page, (err, timeline) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!timeline) {
                            return reply(Boom.notFound('Document not found.'));
                        }
                        reply(timeline);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            reply (request.pre.conversation);
        }
    }]);
    server.route([{
        method: 'POST',
        path: '/conversations/{_id}',
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
                    content: Joi.string().required()
                }
            },
            pre: [{
                assign: 'conversation',
                method: function(request, reply) {
                    Conversation.findById(request.params._id, (err, conversation) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!conversation) {
                            return reply(Boom.notFound('Conversation not found.'));
                        }
                        return reply(conversation);
                    });
                }
            },{
                assign: 'message',
                method: function (request, reply) {
                    const userid = request.auth.credentials._id;
                    Message.create(userid, request.payload.content, (err, message) => {
                        if (err) {
                            return reply(Boom.badRequest('Message not created'));
                        }
                        return reply(message);
                    });
                }
            }
            ]
        },
        handler: function (request, reply) {
            request.pre.conversation.addMessage(request.auth.credentials._id, request.pre.message, (err, conversation) => {
                if (err) {
                    return reply(err);
                }
                return reply(request.pre.message);
            });
        }
    }]);
    server.route([{
        method: 'POST',
        path: '/conversations',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            },
            validate: {
                payload: {
                    _id: Joi.string().token().lowercase().required()
                }
            },
            pre: [{
                assign: 'user',
                method: function (request, reply) {
                    User.findProfileById(request.payload._id, (err, user) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!user) {
                            return reply(Boom.notFound('User not found.'));
                        }
                        return reply(user);
                    });
                }
            },
            {
                assign: 'check',
                method: function (request, reply) {
                    let authors = [];
                    authors.push({_id: Conversation._idClass(request.payload._id)});
                    authors.push({_id: Conversation._idClass(request.auth.credentials._id)});
                    const query = {
                        authors: { $all: authors}
                    };
                    Conversation.find(query, (err, conversation) => {
                        if (err) {
                            return reply(err);
                        }
                        if (conversation.length === 0) {
                            return reply(true);
                        }
                        return reply(Boom.conflict('Conversation exist'));
                    });
                }
            },
            {
                assign: 'conversation',
                method: function(request, reply) {
                    let authors = [];
                    authors.push(request.payload._id);
                    authors.push(request.auth.credentials._id);
                    Conversation.create(authors, reply);
                }
            }]
        },
        handler: function (request, reply) {
            let authors = [];
            authors.push(request.payload._id);
            authors.push(request.auth.credentials._id);
            Conversation.create(authors, (err, conversation) => {
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
    name: 'conversations'
};