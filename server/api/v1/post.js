'use strict';

const Joi = require('joi');
const Boom = require('boom');

const internals = {};

internals.applyRoutes = function (server, next) {

    const Post = server.plugins['hapi-mongo-models'].Post;
    const Comment = server.plugins['hapi-mongo-models'].Comment;

    server.route([{
        method: 'POST',
        path: '/post/{_id}',
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
                    content: Joi.string().required()
                }
            },
            pre: [{
                assign: 'post',
                method: function(request, reply) {
                    Post.findById(request.params._id, (err, post) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!post) {
                            return reply(Boom.notFound('Post not found.'));
                        }
                        return reply(post);
                    });
                }
            }, {
                assign: 'comment',
                method: function (request, reply) {
                    const userId = request.auth.credentials._id;
                    Comment.create(userId, request.payload.content, (err, comment) => {
                        if (err) {
                            return reply(Boom.badRequest('Comment not created'));
                        }
                        return reply(comment);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            request.pre.post.addComment(request.pre.comment._id.toString(), (err, post) => {
                if (err) {
                    return reply(err);
                }
                return (post);
            });
            const comment = request.pre.comment;
            return reply(comment);
        }
    }]);
    server.route([{
        method: 'POST',
        path: '/post/{_id}/{_cid}/like',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            },
            validate: {
                params: {
                    _id: Joi.string().length(24).hex().required(),
                    _cid: Joi.string().length(24).hex().required()
                },
                payload: {
                }
            },
            pre: [{
                assign: 'post',
                method: function(request, reply) {
                    Post.findById(request.params._id, (err, post) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!post) {
                            return reply(Boom.notFound('Post not found.'));
                        }
                        return reply(post);
                    });
                }
            },
                {
                    assign: 'comment',
                    method: function(request, reply) {
                        Comment.findById(request.params._cid, (err, post) => {
                            if (err) {
                                return reply(err);
                            }
                            if (!post) {
                                return reply(Boom.notFound('comment not found.'));
                            }
                            return reply(post);
                        });
                    }
                }]
        },
        handler: function (request, reply) {
            request.pre.comment.addLike(request.auth.credentials._id, (err, post) => {
                if (err) {
                    return reply(err);
                }
                return reply({ message: 'Success.' });
            });
        }
    }]);
    server.route([{
        method: 'POST',
        path: '/post/{_id}/like',
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
                assign: 'post',
                method: function(request, reply) {
                    Post.findById(request.params._id, (err, post) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!post) {
                            return reply(Boom.notFound('Post not found.'));
                        }
                        return reply(post);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            request.pre.post.addLike(request.auth.credentials._id, (err, post) => {
                if (err) {
                    return reply(err);
                }
                return reply({ message: 'Success.' });
            });
        }
    }]);
    next();
};
exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models'], internals.applyRoutes );
    next();
};
exports.register.attributes = {
    name: 'post'
};