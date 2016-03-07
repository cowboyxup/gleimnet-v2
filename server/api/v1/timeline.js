'use strict';

const Joi = require('joi');
const Boom = require('boom');

const internals = {};

internals.applyRoutes = function (server, next) {

    const Timeline = server.plugins['hapi-mongo-models'].Timeline;
    const Post = server.plugins['hapi-mongo-models'].Post;

    server.route([{
        method: 'GET',
        path: '/timeline/{_id}',
        config: {
            auth: {
                strategy: 'jwt'
            },
            validate: {
                params: {
                    _id: Joi.string().length(24).hex().required()
                },
                query: {
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [{
                assign: 'profile',
                method: function(request, reply) {
                    const limit = request.query.limit;
                    const page = request.query.page;
                    Timeline.findByIdAndPaged(request.params._id, limit, page, (err, timeline) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!timeline) {
                            return reply(Boom.notFound('Timeline not found.'));
                        }
                        return reply(timeline);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            /* //TODO check ob page sinnvoll ist
            if (request.pre.profile.pages.current < request.pre.profile.pages.total) {
                return reply(Boom.badRequest('invalid query'));
            }*/
            return reply(request.pre.profile);
        }
    },
    {
        method: 'POST',
        path: '/timeline/{_id}',
        config: {
            auth: {
                strategy: 'jwt'
            },
            validate: {
                params: {
                    _id: Joi.string().length(24).hex().required()
                },
                payload: {
                    content: Joi.string().required()
                }
            },
            pre: [{
                assign: 'timeline',
                method: function(request, reply) {
                    Timeline.findById(request.params._id, (err, timeline) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!timeline) {
                            return reply(Boom.notFound('Document not found.'));
                        }
                        return reply(timeline);
                    });
                }
            }, {
                assign: 'post',
                method: function (request, reply) {
                    const userId = request.auth.credentials._id;
                    Post.create(userId, request.payload.content, (err, post) => {
                        if (err) {
                            return reply(Boom.badRequest('Message not created'));
                        }
                        return reply(post);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            request.pre.timeline.addPost(request.pre.post._id.toString(), (err, timeline) => {
                if (err) {
                    return reply(err);
                }
                return (timeline);
            });
            return reply(request.pre.post);
        }
    }]);
    next();
};
exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models'], internals.applyRoutes );
    next();
};
exports.register.attributes = {
    name: 'timeline'
};