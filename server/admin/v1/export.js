'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Async = require('async');
const jetpack = require('fs-jetpack');
const Handlebars = require('handlebars');
const Pdf = require('html-pdf');

const internals = {};

internals.applyRoutes = function (server, next) {

    server.route({
        method: 'GET',
        path: '/export',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'admin'
            },
            validate: {
            },
            pre:[{
                assign: 'save',
                method: function (request, reply) {
                    const User = server.plugins['hapi-mongo-models'].User;
                    const Message = server.plugins['hapi-mongo-models'].Message;
                    const Conversation = server.plugins['hapi-mongo-models'].Conversation;
                    const Timeline = server.plugins['hapi-mongo-models'].Timeline;
                    const Post = server.plugins['hapi-mongo-models'].Post;
                    const Meeting = server.plugins['hapi-mongo-models'].Meeting;
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
                        loadMeetings: (done) => {
                            Meeting.find({}, (err, data) => {
                                if (err) {
                                    return err;
                                }
                                return done(null, data);
                            });
                        },
                        save: ['loadUsers','loadMessages','loadConversations','loadTimelines','loadPosts', 'loadMeetings', (done, data) => {
                            const document = {
                                users: data.loadUsers,
                                messages: data.loadMessages,
                                conversations: data.loadConversations,
                                timelines: data.loadTimelines,
                                posts: data.loadPosts
                            };
                            return done(null, document);
                        }]
                    }, (err, data) => {
                        if (err) {
                            console.error('Failed save group data.' + err);
                            return (err);
                        }
                        return reply(data.save);
                    });
                }
            },
            {
                assign: 'html',
                method: function (request, reply) {
                    const source = jetpack.dir('./config').read('export.html');
                    const template = Handlebars.compile(source);
                    //console.log(request.pre.save);
                    const html = template(request.pre.save);
                    return reply(html);
                }
            }]
        },
        handler: function (request, reply) {
            const options = {
                'format': 'A4',
                'orientation': 'portrait',
                'border': {
                    'top': '0cm',
                    'right': '1cm',
                    'bottom': '0cm',
                    'left': '1.5cm'
                },
                'base': 'http://cowboy:8000'
            };
            const filename = 'test.html';
            jetpack.dir('./data/hmtl').write(filename,request.pre.html);

            Pdf.create(request.pre.html,options).toStream(function(err, stream){
                if (err) {
                    return reply(err);
                }
                return reply(null, stream).type('application/pdf');
            });
        }
    });


    next();
};
exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models'], internals.applyRoutes );
    next();
};
exports.register.attributes = {
    name: 'adminExport'
};