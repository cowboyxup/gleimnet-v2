'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Async = require('async');
const jetpack = require('fs-jetpack');
const Handlebars = require('handlebars');
const HandlebarsIntl = require('handlebars-intl');
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
                            const users = data.loadUsers;
                            const timeslines = data.loadTimelines;


                            const userDict = [];
                            for (let i = 0; i < users.length; ++i) {
                                const id = users[i]._id.toString();
                                userDict[id] = users[i];
                            }

                            /*for (let i = 0; i < timeslines.length; ++i) {
                                let timeline = timeslines[i];
                                timeline._id = userDict[timeline._id.toString];
                                timeslines[i] = timeline
                            }*/

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
                    var intlData = {
                        "locales": "en-US",
                        "formats": {
                            "date": {
                                "short": {
                                    "day": "numeric",
                                    "month": "long",
                                    "year": "numeric"
                                }
                            }
                        }
                    };

                    HandlebarsIntl.registerWith(Handlebars);
                    const template = Handlebars.compile(source);

                    var intlData = {
                        "locales": "de-DE"
                    };
                    console.log(JSON.stringify(request.pre.save, null, '\t'));
                    const html = template(request.pre.save,{
                        data: {intl: intlData}
                    });
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
                "header": {
                    "height": "20mm",
                },
                "footer": {
                    "height": "20mm",
                },
                'base': server.info.uri
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