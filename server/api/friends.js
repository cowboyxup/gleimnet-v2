'use strict';

const Boom = require('boom');
const Joi = require('joi');
const AuthPlugin = require('../auth');
const Async = require('async');


const internals = {};


internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    const Friend = server.plugins['hapi-mongo-models'].Friend;

    const outputWellFriends = function(ownid,rawfriends, reply) {
        const lightfriends = [];
        for(var i=0; i < rawfriends.length;i++) {
            Async.map(rawfriends[i].friends, function(friend, lightfriends) {
                console.log('friendd:'+JSON.stringify(friend));
                User.findById(friend.id, (err, user) => {
                    if (err) {
                        return callback(err);
                    }
                    const wellUser = user
                    wellUser.isActive = undefined;
                    wellUser.nickname = undefined;
                    wellUser.password = undefined;
                    wellUser.timeCreated = undefined;
                    wellUser.birthdate = undefined;
                    wellUser.description = undefined;
                    wellUser.avatar = undefined;
                    wellUser.titlePicture = undefined;
                    wellUser.timeline = undefined;
                    console.log('we:'+JSON.stringify(wellUser));
                    lightfriends.push(wellUser);
                    console.log('wes:'+JSON.stringify(lightfriends));
                    return (wellUser);
                });
            }, function(err, friends) {
                if (err) {
                    return reply(err);
                }
                console.log(friends);
            });
        }
    };
    server.route({
        method: 'GET',
        path: '/friends',
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
        path: '/friends/{id}',
        config: {
            auth: {
                strategy: 'simple'
            },
            pre: [
            ]
        },
        handler: function (request, reply) {
            Friend.findById(request.params.id, (err, friend) => {
                if (err) {
                    return reply(err);
                }
                if (!friend) {
                    return reply(Boom.notFound('Document not found.'));
                }
                reply(friend);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/friends/{id}',
        config: {
            auth: {
                strategy: 'simple'
            },
            validate: {
                params: {
                    id: Joi.string().length(24).hex().required()
                },
                payload: {
                    activate: Joi.boolean().required()
                }
            },
            pre: [{
                assign: 'friendship',
                method: function(request, reply) {
                    Friend.findByIdAndUpdate(request.params.id.toString(),{$set:{isActive: true}}, (err, friendship) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!friendship) {
                            return reply(Boom.notFound('Friendship not found.'));
                        }
                        reply(friendship);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            const friendship = request.pre.friendship;
            reply (friendship)
        }
    });

    server.route({
        method: 'DELETE',
        path: '/friends/{id}',
        config: {
            auth: {
                strategy: 'simple',
            },
            pre: [
            ]
        },
        handler: function (request, reply) {
            Friend.findByIdAndDelete(request.params.id, (err, friendship) => {
                if (err) {
                    return reply(err);
                }
                if (!friendship) {
                    return reply(Boom.notFound('Friendship not found.'));
                }
                reply({ message: 'Success.' });
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/friends/username/{username}',
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
                    Friend.findConfirmedByUserId(request.pre.user._id.toString(), (err, friends) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!friends) {
                            return reply(Boom.notFound('No friendship found.'));
                        }
                        reply(friends);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            let wellFriends = request.pre.friends;
            reply(wellFriends);
        }
    });
    server.route({
        method: 'GET',
        path: '/friends/my',
        config: {
            auth: {
                strategy: 'simple'
            },
            pre: [{
                assign: 'friends',
                method: function(request, reply) {
                    const id = request.auth.credentials.user._id.toString();
                    Friend.findConfirmedByUserId(id, (err, friends) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!friends) {
                            return reply(Boom.notFound('No friendship found.'));
                        }
                        reply(friends);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            let wellFriends = request.pre.friends;
            reply(wellFriends);
        }
    });
    server.route({
        method: 'GET',
        path: '/friends/my/unconfirmed',
        config: {
            auth: {
                strategy: 'simple'
            },
            pre: [{
                assign: 'friends',
                method: function(request, reply) {
                    const id = request.auth.credentials.user._id.toString();
                    Friend.findUnconfirmedByUserId(id, (err, friends) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!friends) {
                            return reply(Boom.notFound('No friendship found.'));
                        }
                        reply(friends);
                    });
                }
            },{
                assign: 'wellFriends',
                method: function(request, reply) {
                    const id = request.auth.credentials.user._id.toString();
                    return outputWellFriends(request.auth.credentials.user._id.toString(),request.pre.friends, reply);
            }}]
        },
        handler: function (request, reply) {
            let wellFriends = request.pre.wellFriends;
            reply(wellFriends);
        }
    });
    server.route({
        method: 'POST',
        path: '/friends',
        config: {
            auth: {
                strategy: 'simple'
            },
            validate: {
                payload: {
                    username: Joi.string().token().lowercase().required()
                }
            },
            pre: [
                {
                    assign: 'userCheck',
                    method: function (request, reply) {
                        User.findByUsername(request.payload.username, (err, user) => {
                            if (err) {
                                return reply(err);
                            }
                            return reply(user);
                        });
                    }
                }
            ]
        },
        handler: function (request, reply) {
            const id = request.auth.credentials.user._id.toString();
            const userId = request.pre.userCheck._id.toString();
            Friend.create(id, userId, (err, friends) => {
                if (err) {
                    return reply(err);
                }
                reply(friends);
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
    name: 'friends'
};
