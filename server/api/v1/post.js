'use strict';

const Joi = require('joi');
const Boom = require('boom');

const internals = {};

internals.applyRoutes = function (server, next) {

    const Post = server.plugins['hapi-mongo-models'].Post;

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
                    Post.create(userId, request.payload.content, (err, comment) => {
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
            comment.comments = undefined;
            return reply(comment);
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