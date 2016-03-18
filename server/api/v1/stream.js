'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');


const internals = {};


internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;
    const Post = server.plugins['hapi-mongo-models'].Post;

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
                            const sort = Post.sortAdapter('-timeCreated')
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
                                //console.log(JSON.stringify(results, null, '\t'));
                                return done(null, results);
                            });
                        }],
                        clean: ['posts', (done, data) => {
                            const posts = data.posts;
                            let allComments = [];
                            for (let i = 0; i < posts.length; ++i) {
                                for (let j = 0; j < posts[i].comments.length; ++j) {
                                    allComments.push(posts[i].comments[j]);
                                }
                            }
                            console.log(JSON.stringify(allComments, null, '\t'));
                        }]
                    }, (err, data) => {
                        if (err) {
                            console.error('Failed to load data.'+err);
                            return reply(Boom.badRequest('not loaded'));
                        }
                        return reply(data.profile);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            return reply(request.pre.data);
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