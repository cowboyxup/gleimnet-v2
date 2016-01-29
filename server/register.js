'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');

const internals = {};

internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    server.route([{
        method: 'GET',
        path: '/register',
        handler: {
            view: 'register'
        }
    },{
        method: 'POST',
        path: '/register',
        config: {
            validate: {
                payload: {
                    username: Joi.string().token().lowercase().required(),
                    password: Joi.string().required(),
                    email: Joi.string().email().lowercase().required(),
                    passwordSecond: Joi.string().required(),
                    submit: Joi.any().required()
                }
            },
            pre: [{
                assign: 'passwordCheck',
                method: function (request, reply) {
                    if(request.payload.password !== request.payload.passwordSecond) {
                        return reply(Boom.conflict('Password mismatch.'));
                    }
                    reply(true);
                }
            },{
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
            }, {
                assign: 'emailCheck',
                method: function (request, reply) {
                    const conditions = {
                        email: request.payload.email
                    };
                    User.findOne(conditions, (err, user) => {
                        if (err) {
                            return reply(err);
                        }
                        if (user) {
                            return reply(Boom.conflict('Email already in use.'));
                        }
                        reply(true);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            Async.auto({
                user: function (done) {
                    const username = request.payload.username;
                    const password = request.payload.password;
                    const email = request.payload.email;
                    User.create(username, password,email, done);
                }
            }, (err, results) => {
                if (err) {
                    return reply(err);
                }

                const user = results.user;
                reply({
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                    }
                });
            });
        }
    }]);
    next();
};

exports.register = function (server, options, next) {
    server.dependency('hapi-mongo-models', internals.applyRoutes);
    next();
};


exports.register.attributes = {
    name: 'registration'
};