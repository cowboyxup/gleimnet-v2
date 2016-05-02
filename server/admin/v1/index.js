'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Async = require('async');
const jetpack = require('fs-jetpack');
const EJSON = require('mongodb-extended-json');

const internals = {};

internals.applyRoutes = function (server, next) {

    server.route({
        method: 'GET',
        path: '/',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'admin'
            }
        },
        handler: function (request, reply) {
            return reply({ message: 'Welcome to the admin interface' });
        }
    });
    server.route({
        method: 'POST',
        path: '/save',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'admin'
            },
            validate: {
                payload: {
                    institution: Joi.string().required(),
                    group: Joi.string().required()
                }
            },
            pre:[{
                assign: 'save',
                method: function (request, reply) {
                    const User = server.plugins['hapi-mongo-models'].User;
                    const Message = server.plugins['hapi-mongo-models'].Message;
                    const Conversation = server.plugins['hapi-mongo-models'].Conversation;
                    const Timeline = server.plugins['hapi-mongo-models'].Timeline;
                    const Post = server.plugins['hapi-mongo-models'].Post;
                    const Comment = server.plugins['hapi-mongo-models'].Comment;
                    Async.auto({
                        loadUsers: (done) => {
                            User.find({}, (err, data) => {
                                if (err) {
                                    return err;
                                }
                                return done(null, data);
                            });
                        },
                        loadMessages: (done) => {
                            Message.find({}, (err, data) => {
                                if (err) {
                                    return err;
                                }
                                return done(null, data);
                            });
                        },
                        loadConversations: (done) => {
                            Conversation.find({}, (err, data) => {
                                if (err) {
                                    return err;
                                }
                                return done(null, data);
                            });
                        },
                        loadTimelines: (done) => {
                            Timeline.find({}, (err, data) => {
                                if (err) {
                                    return err;
                                }
                                return done(null, data);
                            });
                        },
                        loadPosts: (done) => {
                            Post.find({}, (err, data) => {
                                if (err) {
                                    return err;
                                }
                                return done(null, data);
                            });
                        },
                        loadComments: (done) => {
                            Comment.find({}, (err, data) => {
                                if (err) {
                                    return err;
                                }
                                return done(null, data);
                            });
                        },
                        save: ['loadUsers','loadMessages','loadConversations','loadTimelines','loadPosts', 'loadComments', (done, data) => {
                            const document = {
                                users: data.loadUsers,
                                messages: data.loadMessages,
                                conversations: data.loadConversations,
                                timelines: data.loadTimelines,
                                posts: data.loadPosts,
                                comments: data.loadComments
                            };
                            const savedata = EJSON.stringify(document,null, '\t');
                            const fsOptions = {encoding: 'utf-8'};
                            const date = new Date();
                            const filename = request.payload.institution+"_"+request.payload.group + "-" + (date.toLocaleDateString('de-DE')).replace("\/","-").replace("\/","-") + ".json";
                            jetpack.dir('./data/saved').write(filename,savedata);
                        }]
                    }, (err, data) => {
                        if (err) {
                            console.error('Failed save group data.' + err);
                            return (err);
                        }
                        return (null, data);
                    });
                    reply(true);
                }
            }]
        },
        handler: function (request, reply) {
            return reply({ message: 'Data saved' });
        }
    });
    server.route({
        method: 'POST',
        path: '/load',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'admin'
            },
            validate: {
                payload: {
                    filepath: Joi.string().required()
                }
            },
            pre: [{
                assign: 'clean',
                method: function (request, reply) {
                    const User = server.plugins['hapi-mongo-models'].User;
                    const Message = server.plugins['hapi-mongo-models'].Message;
                    const Conversation = server.plugins['hapi-mongo-models'].Conversation;
                    const Timeline = server.plugins['hapi-mongo-models'].Timeline;
                    const Post = server.plugins['hapi-mongo-models'].Post;
                    const Comment = server.plugins['hapi-mongo-models'].Comment;
                    Async.auto({
                        clean: (done) => {
                            Async.parallel([
                                User.deleteMany.bind(User, {}),
                                Message.deleteMany.bind(Message, {}),
                                Conversation.deleteMany.bind(Conversation, {}),
                                Timeline.deleteMany.bind(Timeline, {}),
                                Post.deleteMany.bind(Post, {}),
                                Comment.deleteMany.bind(Comment, {})
                            ], done);
                        },
                        loadFile: (done, data) => {
                            const fileData = jetpack.dir('./data').read(request.payload.filepath);
                            if (!fileData) {
                                return done(new Error('not loaded'));
                            }
                            return done(null, EJSON.parse(fileData));
                        },
                        user: ['clean','loadFile', (done, data) => {
                            if (data.loadFile['users'].length === 0) {
                                return done(null,[]);
                            }
                            User.insertMany(data.loadFile['users'],(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return done(null, results);
                            });
                        }],
                        message: ['clean','loadFile', (done, data) => {
                            if (data.loadFile['messages'].length === 0) {
                                return done(null,[]);
                            }
                            Message.insertMany(data.loadFile['messages'],(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return done(null,results);
                            });
                        }],
                        timeline: ['clean','loadFile', (done, data) => {
                            if (data.loadFile['timelines'].length === 0) {
                                return done(null,[]);
                            }
                            Timeline.insertMany(data.loadFile['timelines'],(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return done(null,results);
                            });
                        }],
                        post: ['clean','loadFile', (done, data) => {
                            if (data.loadFile['posts'].length === 0) {
                                return done(null,[]);
                            }
                            Post.insertMany(data.loadFile['posts'],(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return done(null,results);
                            });
                        }],
                        comments: ['clean','loadFile', (done, data) => {
                            if (data.loadFile['comments'].length === 0) {
                                return done(null,[]);
                            }
                            Comment.insertMany(data.loadFile['comments'],(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return done(null,results);
                            });
                        }]
                    }, (err, data) => {
                        if (err) {
                            console.error('Failed to load data.'+err);
                            return reply(Boom.badRequest('not loaded'));
                        }
                        return reply(data);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            return reply({ message: 'Data loaded' });
        }
    });

    next();
};
exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models'], internals.applyRoutes );
    next();
};
exports.register.attributes = {
    name: 'adminIndex'
};