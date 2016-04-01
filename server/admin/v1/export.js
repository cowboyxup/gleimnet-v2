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

    const timeslinesDict = [];
    const postsDict = [];
    const userDict = [];

    server.route({
        method: 'GET',
        path: '/export',
        config: {
            tags: ['api'],
            auth: false,
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
                            const posts = data.loadPosts;

                            for (let i = 0; i < users.length; ++i) {
                                const id = users[i]._id.toString();
                                userDict[id] = users[i];
                            }

                            for (let i = 0; i < posts.length; ++i) {
                                const id = posts[i]._id.toString();
                                postsDict[id] = posts[i];
                            }

                            //timelines mit posts und comments füllen
                            for (let i = 0; i < timeslines.length; ++i) {
                                let timeline = timeslines[i];
                                for (let j = 0; j < timeline.posts.length; ++j) {
                                    let id = timeslines[i].posts[j]._id.toString();
                                    let post = postsDict[id];
                                    for (let k = 0; k < post.comments.length; ++k) {
                                        let comment = post.comments[k];
                                        post.comments[k] = postsDict[comment._id.toString()];
                                        post.comments[k].comments = undefined;
                                    }
                                    timeslines[i].posts[j] = post;
                                }
                            }
                            
                            // timeslines dict füllen
                            for (let i = 0; i < timeslines.length; ++i) {
                                const id = timeslines[i]._id.toString();
                                timeslinesDict[id] = timeslines[i];
                            }
                            
                            // users mit timesline objects füllen
                            for (let i = 0; i < users.length; ++i) {
                                let user = users[i];
                                user.timeline = timeslinesDict[user.timeline];
                            }

                            const document = {
                                users: users,
                                messages: data.loadMessages,
                                conversations: data.loadConversations,
                                timelines: timeslines,
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

                    HandlebarsIntl.registerWith(Handlebars);
                    Handlebars.registerHelper('timeline', function(timeline) {
                        let document = '';
                        for (let i = 0; i < timeline.posts.length; ++i) {
                            document = document.concat('<div class=\"col s12 card z-depth-0 posting\">');
                            document = document.concat('<div class=\"posting_header meta\">');
                            document = document.concat('<img src=\"'+userDict[timeline.posts[i].author].avatar+'\" class="round_avatar48">');
                            document = document.concat('<div class=\"comment__author\"><strong>'+userDict[timeline.posts[i].author].nickname+'</strong> <span>'+timeline.posts[i].timeCreated.toLocaleString()+'</span></div>');
                            document = document.concat('</div>');
                            document = document.concat('<div class=\"posting_contet\">'+timeline.posts[i].content+'</div>');
                            const comments = timeline.posts[i].comments.reverse();
                            if (comments.length > 0 ) {
                                document = document.concat('<div class=\"posting_contet comments\">');
                                for (let j = 0; j < comments.length; ++j) {
                                    document = document.concat('<div class=\"comment\">');
                                    document = document.concat('<div class=\"comment__header\">');
                                    document = document.concat('<img src=\"'+userDict[comments[j].author].avatar+'\" class="round_avatar48">');
                                    document = document.concat('<div class=\"comment__author\"><strong>'+userDict[comments[j].author].nickname+'</strong> <span>'+comments[j].timeCreated.toLocaleString()+'</span></div>');
                                    document = document.concat('</div>');
                                    document = document.concat('<div class=\"comment__text\">'+comments[j].content+'</div>');
                                    document = document.concat('</div>');

                                }
                                document = document.concat('</div>');
                            }
                            document = document.concat('</div>');
                        }
                        return new Handlebars.SafeString(document);
                    });
                    Handlebars.registerHelper('tags', function(tags) {
                        let document = '';
                        for (let i = 0; i < tags.length; ++i) {
                            document = document.concat('<span class=\"tag\">'+tags[i]+'</span>, ');
                        }
                        return new Handlebars.SafeString(document);
                    });
                    Handlebars.registerHelper('friends', function(friends) {
                        let document = '';
                        for (let i = 0; i < friends.length; ++i) {
                            document = document.concat('<span class=\"friends\">'+userDict[friends[i]._id].nickname+'</span>, ');
                        }
                        return new Handlebars.SafeString(document);
                    });
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
            jetpack.dir('./data/html').write(filename,request.pre.html);

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