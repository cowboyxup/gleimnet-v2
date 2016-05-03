'use strict';

const Joi = require('joi');
const Boom = require('boom');

const internals = {};

internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;

    server.route({
        method: 'GET',
        path: '/profile',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt',
            },
            validate: {
                query: {
                    search: Joi.string().token().lowercase(),
                    fields: Joi.string(),
                    sort: Joi.string().default('_id'),
                    limit: Joi.number().default(40),
                    page: Joi.number().default(1)
                }
            },
            pre: [
            ]
        },
        handler: function (request, reply) {
            const query = {};
            if (request.query.search) {
                const regex = new RegExp('^.*?' + request.query.search + '.*$', 'i');
                query.$or =  [
                    { username: regex},
                    { surname: regex },
                    { givenName: regex },
                    { nickname: regex }
                ];
            }
            query.isActive = true;
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
                    description: Joi.string().allow(''),
                    tags: Joi.array().max(5).items(
                        Joi.string()
                    ),
                    birthplace: Joi.string().allow(''),
                    influenceplace: Joi.string().allow('')
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