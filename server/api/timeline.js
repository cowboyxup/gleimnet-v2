'use strict';

const Boom = require('boom');
const Joi = require('joi');
const AuthPlugin = require('../auth');


const internals = {};


internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    const Conversation = server.plugins['hapi-mongo-models'].Conversation;

    server.route({
        method: 'GET',
        path: '/timeline',
        config: {
            auth: {
                strategy: 'simple'
            },
            validate: {
            },
            pre: [
            ]
        },
        handler: function (request, reply) {
            User.pagedFind(query, fields, sort, limit, page, (err, results) => {
                if (err) {
                    return reply(err);
                }
                reply(results);
            });
        }
    });

    server.route({
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
                    const username = request.payload.username;
                    const password = request.payload.password;
                    User.findByUsername(username, (err, user) => {
                        if (err) {
                            return reply(Boom.badRequest('Username not found'));
                        }
                        reply(user);
                    });
                }
            },
            ]
        },
        handler: function (request, reply) {
            Conversation.findById(request.pre.user._id, (err, timeline) => {
                if (err) {
                    return reply(err);
                }
                if (!timeline) {
                    return reply(Boom.notFound('Document not found.'));
                }
                reply(timeline);
            });
        }
    });
    next();
};


exports.register = function (server, options, next) {
    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);
    next();
};


exports.register.attributes = {
    name: 'timeline'
};
