'use strict';

const Joi = require('joi');
const Boom = require('boom');

const internals = {};

internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;

    server.route({
        method: 'GET',
        path: '/friends',
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
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [
            ]
        },
        handler: function (request, reply) {
            const query = {};
            if (request.query.search) {
                query.username = new RegExp('^.*?' + request.query.search + '.*$', 'i');
                //query.surename = new RegExp('^.*?' + request.query.search + '.*$', 'i');
                //query.givenName = new RegExp('^.*?' + request.query.search + '.*$', 'i');
                //query.nickname = new RegExp('^.*?' + request.query.search + '.*$', 'i');
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
        path: '/friends/unconfirmed',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            },
            validate: {
            },
            pre: [{
                assign: 'profile',
                method: function(request, reply) {
                    User.findById(request.auth.credentials._id, (err, profil) => {
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
            return reply('{'+request.pre.profile.unconfirmedFriends+'}');
        }
    }]);
    server.route([{
        method: 'GET',
        path: '/friends/sent',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            },
            validate: {
            },
            pre: [{
                assign: 'profile',
                method: function(request, reply) {
                    User.findById(request.auth.credentials._id, (err, profil) => {
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
            return reply('{'+request.pre.profile.sentFriends+'}');
        }
    }]);

    server.route([{
        method: 'POST',
        path: '/friends/{_id}',
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
                }
            },
            pre: [{
                assign: 'check',
                method: function(request, reply) {
                    if (request.auth.credentials._id === request.params._id) {
                        return reply(Boom.conflict('You can not be your own friend.'));
                    }
                    return reply(true);
                }
            },
                {
                assign: 'ownProfile',
                method: function(request, reply) {
                    User.findById(request.auth.credentials._id, (err, profil) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!profil) {
                            return reply(Boom.notFound('Profile not found.'));
                        }
                        return reply(profil);
                    });
                }
            },
            {
                assign: 'givenProfile',
                method: function(request, reply) {
                    User.findById(request.params._id, (err, profil) => {
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
            const findFriends = function(item) {
                return item._id === request.params._id;
            };
            if (request.pre.ownProfile.friends.find(findFriends)) {
                return reply('User is already your friend.').statusCode(304);
            }
            if (request.pre.ownProfile.sentFriends.find(findFriends)) {
                return reply('You have already sent a friendship response').code(304);
            }

            if (request.pre.ownProfile.unconfirmedFriends.find(findFriends)) {
                return reply('User is now your friend.');
            }
            request.pre.ownProfile.addSentFriend(request.params._id,(err, profile) => {
                if (err) {
                    return reply(err);
                }
                return true;
            });
            request.pre.givenProfile.addUnconfirmedFriend(request.auth.credentials._id,(err, profile) => {
                if (err) {
                    return reply(err);
                }
                return true;
            });
            return reply(request.pre.ownProfile);
        }
    }]);

    next();
};
exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models'], internals.applyRoutes );
    next();
};
exports.register.attributes = {
    name: 'friends'
};