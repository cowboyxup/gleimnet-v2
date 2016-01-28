'use strict';

const Boom = require('boom');
const Joi = require('joi');
const AuthPlugin = require('../auth');


const internals = {};


internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    const Conversation = server.plugins['hapi-mongo-models'].Conversation;
    const Message = server.plugins['hapi-mongo-models'].Message;
    server.route([{
        method: 'GET',
        path: '/timeline',
        config: {
            auth: {
                strategy: 'simple'
            },
            validate: {
            },
            pre: [{
                assign: 'user',
                method: function (request, reply) {
                    const userid = request.auth.credentials.session.userId;
                    User.findById(userid, (err, user) => {
                        if (err) {
                            return reply(Boom.badRequest('Username not found'));
                        }
                        reply(user);
                    });
                }
            },{
                assign: 'conversation',
                method: function(request, reply) {
                    Conversation.findById(request.pre.user.timeline.id, (err, timeline) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!timeline) {
                            return reply(Boom.notFound('Document not found.'));
                        }
                        reply(timeline);
                    });
                }
            },{
                assign: 'conversationmessages',
                method: function(request, reply) {
                    Conversation.findById(request.pre.user.timeline.id, (err, timeline) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!timeline) {
                            return reply(Boom.notFound('Document not found.'));
                        }
                        reply(timeline);
                    });
                }
            }
            ]
        },
        handler: function (request, reply) {
            reply (request.pre.conversation);
        }
    },{
        method: 'POST',
        path: '/timeline',
        config: {
            auth: {
                strategy: 'simple'
            },
            validate: {
                payload: {
                    content: Joi.string().required()
                }
            },
            pre: [{
                assign: 'user',
                method: function (request, reply) {
                    const userid = request.auth.credentials.session.userId;
                    User.findById(userid, (err, user) => {
                        if (err) {
                            return reply(Boom.badRequest('Username not found'));
                        }
                        reply(user);
                    });
                }
            },{
                assign: 'conversation',
                method: function(request, reply) {
                    Conversation.findById(request.pre.user.timeline.id, (err, timeline) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!timeline) {
                            return reply(Boom.notFound('Document not found.'));
                        }
                        reply(timeline);
                    });
                }
            }, {
                assign: 'message',
                method: function (request, reply) {
                    const userid = request.pre.user._id;
                    Message.create(userid, request.payload.content, (err, message) => {
                        if (err) {
                            return reply(Boom.badRequest('Message not created'));
                        }
                        reply(message);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            request.pre.conversation.addMessage(request.pre.user._id.toString(),request.pre.message._id.toString(), (err, conversation) => {
                if (err) {
                    return reply(err);
                }
                reply(conversation);
            });
        }
    },{
        method: 'GET',
        path: '/timeline/{username}',
        config: {
            auth: {
                strategy: 'simple'
            },
            validate: {
                params: {
                    username: Joi.string().token().lowercase().required()
                }
            },
            pre: [{
                assign: 'user',
                method: function (request, reply) {
                    const username = request.params.username;
                    User.findByUsername(username, (err, user) => {
                        if (err) {
                            return reply(Boom.badRequest('Username not found'));
                        }
                        reply(user);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            console.log(request.headers);
            Conversation.findById(request.pre.user.timeline.id, (err, timeline) => {
                if (err) {
                    return reply(err);
                }
                if (!timeline) {
                    return reply(Boom.notFound('Document not found.'));
                }
                reply(timeline);
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
    name: 'timeline'
};
