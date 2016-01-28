'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');
const AuthPlugin = require('../auth');


const internals = {};


internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    const Conversation = server.plugins['hapi-mongo-models'].Conversation;
    const Message = server.plugins['hapi-mongo-models'].Message;


    const outputTimeline = function(conversation, reply) {
        Async.map(conversation.messages, function(id, callback) {
            Message.findById(id.id, (err, message) => {
                if (err) {
                    return callback(err);
                }
                if (message.comments.length !== 0){
                    console.log("dinge");
                    outputComments(message,(err, message) => {
                        console.log(message);
                        if (err) {
                            return (err);
                        }
                        callback(null, message);
                    });
                } else   {
                    callback(null, message);
                }
            })
        }, function(err, messages) {
            if (err) {
                return reply(err);
            }
            const timeline = conversation;
            timeline.messages = messages;
            timeline.authors = undefined;
            reply(timeline);
        });

    };
    const outputComments = function(message, callback) {
        Async.map(message.comments, function(id, callback) {
            Message.findById(id.id, (err, comment) => {
                if (err) {
                    return callback(err);
                }
                const showcomment = comment;
                showcomment.comments = undefined;
                callback(null, showcomment);
            })
        }, function(err, comments) {
            if (err) {
                return callback(err);
            }
            const updatedMessage = message;
            updatedMessage.comments = comments;
            return callback(null,updatedMessage);
        });

    };
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
                    return outputTimeline(request.pre.conversation, reply);
                }
            }]
        },
        handler: function (request, reply) {
            reply (request.pre.conversationmessages);
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
                return outputTimeline(conversation, reply);
            });
        }
    },{
        method: 'POST',
        path: '/timeline/message/{messageId}',
        config: {
            auth: {
                strategy: 'simple'
            },
            validate: {
                params: {
                    messageId: Joi.string().length(24).hex().required()
                },
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
                assign: 'message',
                method: function(request, reply) {
                    Message.findById(request.params.messageId, (err, message) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!message) {
                            return reply(Boom.notFound('Message not found.'));
                        }
                        reply(message);
                    });
                }
            }, {
                assign: 'comment',
                method: function (request, reply) {
                    const userid = request.pre.user._id;
                    Message.create(userid, request.payload.content, (err, comment) => {
                        if (err) {
                            return reply(Boom.badRequest('Message not created'));
                        }
                        reply(comment);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            request.pre.message.addComment(request.pre.user._id.toString(),request.pre.comment._id.toString(), (err, message) => {
                if (err) {
                    return reply(err);
                }
                return outputComments(message, reply);
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
                    return outputTimeline(request.pre.conversation, reply);
                }
            }]
        },
        handler: function (request, reply) {
            reply (request.pre.conversationmessages);
        }
    },{
        method: 'POST',
        path: '/timeline/{username}',
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
                    const username = request.params.username;
                    User.findByUsername(username, (err, user) => {
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
                return outputTimeline(conversation, reply);
            });
        }
    },]);
    next();
};


exports.register = function (server, options, next) {
    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);
    next();
};


exports.register.attributes = {
    name: 'timeline'
};
