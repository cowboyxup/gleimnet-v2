'use strict';

const Boom = require('boom');
const Joi = require('joi');
const AuthPlugin = require('../auth');


const internals = {};


internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    const Friend = server.plugins['hapi-mongo-models'].Friend;

    server.route({
        method: 'GET',
        path: '/users',
        config: {
            auth: {
                strategy: 'simple',
        },
            validate: {
                query: {
                    username: Joi.string().token().lowercase(),
                    isActive: Joi.string(),
                    fields: Joi.string(),
                    sort: Joi.string().default('_id'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [
            ]
        },
        handler: function (request, reply) {
            const query = {};
            if (request.query.username) {
                query.username = new RegExp('^.*?' + request.query.username + '.*$', 'i');
            }
            if (request.query.isActive) {
                query.isActive = request.query.isActive === 'true';
            }
            const fields = request.query.fields;
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;
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
        path: '/users/{id}',
        config: {
            auth: {
                strategy: 'simple'
            },
            pre: [
            ]
        },
        handler: function (request, reply) {
            User.findById(request.params.id, (err, user) => {
                if (err) {
                    return reply(err);
                }
                if (!user) {
                    return reply(Boom.notFound('Document not found.'));
                }
                reply(user);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/users/username/{username}',
        config: {
            auth: {
                strategy: 'simple'
            },
            pre: [{
                assign: 'user',
                method: function (request, reply) {
                    User.findByUsername(request.params.username, (err, user) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!user) {
                            return reply(Boom.notFound('Document not found.'));
                        }
                        reply(user);
                    });
                }
            },{
                assign: 'friends',
                method: function(request, reply) {
                    console.log(request.pre.user);
                    Friend.findByUserId(request.pre.user._id, (err, friends) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!friends) {
                            return reply(Boom.notFound('No Friends not found.'));
                        }
                        reply(friends);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            let wellUser = request.pre.user;
            wellUser.password = undefined;
            wellUser.isActive = undefined;

            reply(wellUser);
        }
    });

    server.route({
        method: 'GET',
        path: '/users/my',
        config: {
            auth: {
                strategy: 'simple'
            }
        },
        handler: function (request, reply) {

            const id = request.auth.credentials.user._id.toString();
            const fields = User.fieldsAdapter('username email roles');
            User.findById(id, fields, (err, user) => {
                if (err) {
                    return reply(err);
                }
                if (!user) {
                    return reply(Boom.notFound('Document not found. That is strange.'));
                }

                reply(user);
            });
        }
    });


    server.route({
        method: 'POST',
        path: '/users',
        config: {
            auth: {
                strategy: 'simple'
            },
            validate: {
                payload: {
                    username: Joi.string().token().lowercase().required(),
                    password: Joi.string().required(),
                    email: Joi.string().email().lowercase().required()
                }
            },
            pre: [
                {
                    assign: 'usernameCheck',
                    method: function (request, reply) {
                        const conditions = {
                            username: request.payload.username
                        };
                        User.findOne(conditions, (err, user) => {
                            if (err) {
                                return reply(err);
                            }
                            if (user) {
                                return reply(Boom.conflict('Username already in use.'));
                            }
                            reply(true);
                        });
                    }
                }
            ]
        },
        handler: function (request, reply) {
            const username = request.payload.username;
            const password = request.payload.password;
            User.create(username, password, (err, user) => {
                if (err) {
                    return reply(err);
                }
                reply(user);
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
    name: 'users'
};
