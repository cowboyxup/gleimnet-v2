'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');
const Bcrypt = require('bcryptjs');
const Config = require('../../config');


const internals = {};


internals.applyRoutes = function (server, next) {

    const AuthAttempt = server.plugins['hapi-mongo-models'].AuthAttempt;
    const Session = server.plugins['hapi-mongo-models'].Session;
    const User = server.plugins['hapi-mongo-models'].User;

    server.route({
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
                assign: 'abuseDetected',
                method: function (request, reply) {
                    const ip = request.info.remoteAddress;
                    const username = request.payload.username;
                    AuthAttempt.abuseDetected(ip, username, (err, detected) => {
                        if (err) {
                            return reply(err);
                        }
                        if (detected) {
                            return reply(Boom.badRequest('Maximum number of auth attempts reached. Please try again later.'));
                        }
                        reply();
                    });
                }
            }, {
                assign: 'user',
                method: function (request, reply) {
                    const username = request.payload.username;
                    const password = request.payload.password;
                    User.findByCredentials(username, password, (err, user) => {
                        if (err) {
                            return reply(err);
                        }
                        reply(user);
                    });
                }
            }, {
                assign: 'logAttempt',
                method: function (request, reply) {
                    if (request.pre.user) {
                        return reply();
                    }
                    const ip = request.info.remoteAddress;
                    const username = request.payload.username;
                    AuthAttempt.create(ip, username, (err, authAttempt) => {
                        if (err) {
                            return reply(err);
                        }
                        return reply(Boom.badRequest('Username and password combination not found or account is inactive.'));
                    });
                }
            }, {
                assign: 'session',
                method: function (request, reply) {
                    Session.create(request.pre.user._id.toString(), (err, session) => {
                        if (err) {
                            return reply(err);
                        }
                        return reply(session);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            const credentials = request.pre.session._id.toString() + ':' + request.pre.session.key;
            const authHeader = 'Basic ' + new Buffer(credentials).toString('base64');
            reply({
                user: {
                    _id: request.pre.user._id,
                    username: request.pre.user.username,
                },
                session: request.pre.session,
                authHeader: authHeader
            });
        }
    });
    next();
};


exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models'], internals.applyRoutes);
    next();
};


exports.register.attributes = {
    name: 'login'
};
