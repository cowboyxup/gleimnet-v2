'use strict';

const Joi = require('joi');
const Boom = require('boom');

const internals = {};

internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;

    server.route([{
        method: 'GET',
        path: '/profile/{_id}',
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
                assign: 'profile',
                method: function(request, reply) {
                    User.findProfileById(request.params._id, (err, profil) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!profil) {
                            return reply(Boom.notFound('Profile not found.'));
                        }
                        return reply(profil);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            return reply(request.pre.profile);
        }
    },
    {
        method: 'POST',
        path: '/profile/{_id}',
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
                    birthdate: Joi.date(),
                    description: Joi.string(),
                    tags: Joi.array().max(5).items(
                        Joi.string()
                    ),
                    birthplace: Joi.string(),
                    influenceplace: Joi.string()
                }
            },
            pre: [{
                assign: 'profile',
                method: function(request, reply) {
                    if(request.auth.credentials._id === request.params._id) {
                        User.findProfileByIdAndUpdate(request.auth.credentials._id, request.payload, (err, profil) => {
                            if (err) {
                                return reply(err);
                            }
                            if (!profil) {
                                return reply(Boom.notFound('Profil not found.'));
                            }
                            return reply(profil);
                        });
                    }
                    else {
                        return reply(Boom.forbidden('It is not your profile. You are only allowed to modify your own profile'));
                    }
                }
            }]
        },
        handler: function (request, reply) {
            return reply(request.pre.profile);
        }
    }]);
    next();
};
exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models'], internals.applyRoutes );
    next();
};
exports.register.attributes = {
    name: 'profile'
};