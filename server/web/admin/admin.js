'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');

const internals = {};

internals.applyRoutes = function (server, next) {
    const Admin = server.plugins['hapi-mongo-models'].Admin;

    const cache = server.cache({
        segment: 'sessions',
        expiresIn: 3 * 24 * 60 * 60 * 1000
    });
    server.app.cache = cache;

    server.auth.strategy('admin', 'basic', true, {
        redirectTo: '/login',
        isSecure: false,
        validateFunc: function(request, username, password, callback) {
            cache.get(username, (err, value, cached, log) => {
                if (err) {
                    return callback(err, false);
                }
                if (!cached) {
                    return callback(null, false);
                }
                return callback(null, true, cached.account);
            });
        }
    });


    server.route([{
        method: 'GET',
        path: '/',
        config: {
            validate: {
                params: {
                }
            },
            auth: {
                strategy: 'admin'
            },
            pre: [],
            handler: {
                view: 'index'
            }
        }
    },{
        method: 'GET',
        path: '/login',
        config: {
            pre: [{
                assign: 'tisAuthenticated',
                method: function (request, reply) {
                    if (request.auth.isAuthenticated) {
                        return reply.redirect('/');
                    }
                    reply(true);
                }
            }],
            handler: {
                view: 'login'
            },
            auth: {
                mode: 'try',
                strategy: 'admin'
            },
            plugins: {
                'hapi-auth-basic': {
                    redirectTo: false
                }
            }
        }
    },{
        method: 'POST',
        path: '/login',
        config: {
            validate: {
                payload: {
                    username: Joi.string().lowercase().required(),
                    password: Joi.string().required()
                }
            },
            pre: [{
                assign: 'admin',
                method: function (request, reply) {
                    const username = request.payload.username;
                    const password = request.payload.password;
                    Admin.findByCredentials(username, password, (err, admin) => {
                        if (err) {
                            return reply(err);
                        }
                        reply(admin);
                    });
                }
            },{
                assign: 'session',
                method: function (request, reply) {
                    Session.create(request.pre.admin._id.toString(), (err, session) => {
                        if (err) {
                            return reply(err);
                        }
                        return reply(session);
                    });
                    cache.set(request.pre.admin._id.toString(), { account: user.username }, null, (err) => {
                        if (err) {
                            return reply(err);
                        }
                        return reply.redirect('/home');
                    });
                }
            }]
        },
        handler: function (request, reply) {
            const credentials = request.pre.session._id.toString() + ':' + request.pre.session.key;
            const authHeader = 'Basic ' + new Buffer(credentials).toString('base64');
            reply({
                admin: {
                    _id: request.pre.user._id,
                    username: request.pre.user.username,
                },
                session: request.pre.session,
                authHeader: authHeader
            });
        }
    }, {
        method: 'GET',
        path: '/logout',
        config: {
            auth: false,
            handler: function (request, reply) {
                request.auth.session.clear();
                return reply.redirect('login');
            }
        }
    }]);
    next();
};

exports.register = function (server, options, next) {
    server.dependency('hapi-mongo-models', internals.applyRoutes);
    next();
};

exports.register.attributes = {
    name: 'admin'
};