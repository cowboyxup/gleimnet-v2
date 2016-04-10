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
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [{
                assign: 'data',
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
            const limit = request.query.limit;
            const page = request.query.page;
            const output = {
                data: undefined,
                pages: {
                    current: page,
                    prev: 0,
                    hasPrev: false,
                    next: 0,
                    hasNext: false,
                    total: 0
                },
                items: {
                    limit: limit,
                    begin: ((page * limit) - limit) + 1,
                    end: page * limit,
                    total: 0
                }
            };

            output.data = request.pre.data.friends.slice((output.items.begin - 1), output.items.end);
            output.items.total = request.pre.data.friends.length;

            // paging calculations
            output.pages.total = Math.ceil(output.items.total / limit);
            output.pages.next = output.pages.current + 1;
            output.pages.hasNext = output.pages.next <= output.pages.total;
            output.pages.prev = output.pages.current - 1;
            output.pages.hasPrev = output.pages.prev !== 0;
            if (output.items.begin > output.items.total) {
                output.items.begin = output.items.total;
            }
            if (output.items.end > output.items.total) {
                output.items.end = output.items.total;
            }

            return reply(output);
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
                query: {
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [{
                assign: 'data',
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
            const limit = request.query.limit;
            const page = request.query.page;
            const output = {
                data: undefined,
                pages: {
                    current: page,
                    prev: 0,
                    hasPrev: false,
                    next: 0,
                    hasNext: false,
                    total: 0
                },
                items: {
                    limit: limit,
                    begin: ((page * limit) - limit) + 1,
                    end: page * limit,
                    total: 0
                }
            };

            output.data = request.pre.data.unconfirmedFriends.slice((output.items.begin - 1), output.items.end);
            output.items.total = request.pre.data.unconfirmedFriends.length;

            // paging calculations
            output.pages.total = Math.ceil(output.items.total / limit);
            output.pages.next = output.pages.current + 1;
            output.pages.hasNext = output.pages.next <= output.pages.total;
            output.pages.prev = output.pages.current - 1;
            output.pages.hasPrev = output.pages.prev !== 0;
            if (output.items.begin > output.items.total) {
                output.items.begin = output.items.total;
            }
            if (output.items.end > output.items.total) {
                output.items.end = output.items.total;
            }

            return reply(output);
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
                query: {
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [{
                assign: 'data',
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
            const limit = request.query.limit;
            const page = request.query.page;
            const output = {
                data: undefined,
                pages: {
                    current: page,
                    prev: 0,
                    hasPrev: false,
                    next: 0,
                    hasNext: false,
                    total: 0
                },
                items: {
                    limit: limit,
                    begin: ((page * limit) - limit) + 1,
                    end: page * limit,
                    total: 0
                }
            };

            output.data = request.pre.data.sentFriends.slice((output.items.begin - 1), output.items.end);
            output.items.total = request.pre.data.sentFriends.length;

            // paging calculations
            output.pages.total = Math.ceil(output.items.total / limit);
            output.pages.next = output.pages.current + 1;
            output.pages.hasNext = output.pages.next <= output.pages.total;
            output.pages.prev = output.pages.current - 1;
            output.pages.hasPrev = output.pages.prev !== 0;
            if (output.items.begin > output.items.total) {
                output.items.begin = output.items.total;
            }
            if (output.items.end > output.items.total) {
                output.items.end = output.items.total;
            }

            return reply(output);
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
                return item._id.toString() === request.params._id;
            };
            if (request.pre.ownProfile.friends.find(findFriends)) {
                return reply('User is already your friend.').code(304);
            }
            if (request.pre.ownProfile.sentFriends.find(findFriends)) {
                return reply('You have already sent a friendship response').code(304);
            }

            if (request.pre.ownProfile.unconfirmedFriends.find(findFriends)) {
                request.pre.ownProfile.addFriend(request.params._id,(err, profile) => {
                    if (err) {
                        return reply(err);
                    }
                    return true;
                });
                request.pre.givenProfile.addFriend(request.auth.credentials._id,(err, profile) => {
                    if (err) {
                        return reply(err);
                    }
                    return true;
                });
                return reply({ message: 'User is now your friend.'});
            }
            request.pre.givenProfile.addUnconfirmedFriend(request.auth.credentials._id,(err, profile) => {
                if (err) {
                    return reply(err);
                }
                return true;
            });
            request.pre.ownProfile.addSentFriend(request.params._id,(err, profile) => {
                if (err) {
                    return reply(err);
                }
                return true;
            });
            return reply({ message: 'Success.' });
        }
    }]);

    server.route({
        method: 'DELETE',
        path: '/friends/{_id}',
        config: {
            tags: ['api'],
            auth: {
                mode: 'try',
                strategy: 'jwt'
            },
            validate: {
                params: {
                    _id: Joi.string().length(24).hex().required()
                }
            },
            pre: [{
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
            request.pre.ownProfile.removeFriend(request.params._id,(err, profile) => {
                if (err) {
                    return reply(err);
                }
                return true;
            });
            request.pre.givenProfile.removeFriend(request.auth.credentials._id,(err, profile) => {
                if (err) {
                    return reply(err);
                }
                return true;
            });
            return reply({ message: 'Success.' });
        }
    });

    next();
};
exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models'], internals.applyRoutes );
    next();
};
exports.register.attributes = {
    name: 'friends'
};