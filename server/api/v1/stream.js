'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');


const internals = {};


internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    const Post = server.plugins['hapi-mongo-models'].Post;
    const Comment = server.plugins['hapi-mongo-models'].Comment;

    server.route([{
        method: 'GET',
        path: '/stream',
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
                    Async.auto({
                        profile: (done) => {
                            User.findProfileById(request.auth.credentials._id, (err, profile) => {
                                if (err) {
                                    return err;
                                }
                                if (!profile) {
                                    return reply(Boom.notFound('Profile not found.'));
                                }
                                return done(null, profile);
                            });
                        },
                        posts: ['profile', (done, data) => {
                            const friends = data.profile.friends.map(function (item){return item._id});
                            friends.push(data.profile._id);
                            const sort = Post.sortAdapter('-timeCreated');
                            const query = {
                                author: { $in: friends }
                            };
                            const options = {
                                //limit: limit,
                                sort: sort
                            };
                            Post.find(query,options,(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return done(null, results);
                            });
                        }],
                        comments: ['posts', (done, data) => {
                            const posts = data.posts;
                            let allComments = [];
                            for (let i = 0; i < posts.length; ++i) {
                                for (let j = 0; j < posts[i].comments.length; ++j) {
                                    allComments.push(Post._idClass(posts[i].comments[j]._id));
                                }
                            }
                            const queryComments = {
                                '_id': {
                                    $in: allComments
                                }
                            };
                            Comment.find(queryComments, done);
                        }]
                    }, (err, data) => {
                        if (err) {
                            console.error('Failed to load data.'+err);
                            return reply(Boom.badRequest('not loaded'));
                        }
                        let tempPost = data.posts;
                        let comments = data.comments;

                        const allCommentsDict = [];
                        for (let i = 0; i < comments.length; ++i) {
                            const id = comments[i]._id.toString();
                            allCommentsDict[id] = comments[i];
                        }
                        for (let i = 0; i < tempPost.length; ++i) {
                            for (let j = 0; j < tempPost[i].comments.length; ++j) {
                                const id = tempPost[i].comments[j]._id.toString()
                                let comment = allCommentsDict[id];
                                tempPost[i].comments[j] = comment;
                            }
                        }
                        return reply(tempPost);
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

            output.data = request.pre.data.slice((output.items.begin-1),output.items.end);
            output.items.total = request.pre.data.length;

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
    next();
};

exports.register = function (server, options, next) {
    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);
    next();
};


exports.register.attributes = {
    name: 'stream'
};