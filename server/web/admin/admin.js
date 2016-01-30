'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');

const Fs = require('fs');
const Path = require('path');
const EJSON = require('mongodb-extended-json');
const BSON = require('bson');

const internals = {};

internals.applyRoutes = function (server, next) {
    const Admin = server.plugins['hapi-mongo-models'].Admin;

    const cache = server.cache({
        segment: 'sessions',
        expiresIn: 3 * 24 * 60 * 60 * 1000
    });
    server.app.cache = cache;

    server.auth.strategy('admin', 'cookie', true, {
        password: 'superdfad',
        cookie: 'gleimnet-admin',
        redirectTo: '/admin/login',
        isSecure: false,
        validateFunc: function (request, session, callback) {
           cache.get(session.sid,(err, value, cached, log) => {
              if(err) {
                  return callback(err, false);
              }
               if(!cached) {
                   return callback(null, false);
               }
               return callback(null, true, cached.account);
           });
        }
    });

    server.route([{
        method: 'GET',
        path: '/',
        config: {
            validate: {
                params: {
                }
            },
            auth: {
                strategy: 'admin'
            },
            pre: [[{
                assign: 'listConfigs',
                method: function (request, reply) {
                    Fs.readdir(Path.join(__dirname,'..','..','..','data','config'), (err, files) => {
                        if(err) {
                            return (err);
                        }
                        return reply(files);
                    });
                }
            },{
                assign: 'listOldGroups',
                method: function (request, reply) {
                    Fs.readdir(Path.join(__dirname,'..','..','..','data','saved'), (err, files) => {
                        if(err) {
                            return (err);
                        }
                        return reply(files);
                    });
                }
            }]],
            handler: function(request, reply) {
                const configs = request.pre.listConfigs;
                const oldGroups = request.pre.listOldGroups;
                reply.view('index',{
                    title: 'Gleimnet Administration',
                    auth: true,
                    config: configs,
                    oldGroup: oldGroups
                })
            }
        }
    },{
        method: 'GET',
        path: '/login',
        config: {
            pre: [{
                assign: 'tisAuthenticated',
                method: function (request, reply) {
                    if (request.auth.isAuthenticated) {
                        return reply.redirect('/');
                    }
                    reply(true);
                }
            }],
            handler: {
                view: 'login'
            },
            auth: {
                mode: 'try',
                strategy: 'admin'
            },
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            }
        }
    },{
        method: 'POST',
        path: '/login',
        config: {
            validate: {
                payload: {
                    username: Joi.string().token().lowercase().required(),
                    password: Joi.string().required(),
                    submit: Joi.any().required()
                }
            },
            pre: [{
                assign: 'isAuthenticated',
                method: function (request, reply) {
                    if (request.auth.isAuthenticated) {
                        //return reply.redirect('/admin/');
                        return reply.redirect(request.query.next);
                    }
                    reply(true);
                }
            }, {
                assign: 'adminCheck',
                method: function (request, reply) {
                    Admin.findByCredentials(request.payload.username, request.payload.password, (err, admin) => {
                        if (err) {
                            return reply(err);
                        }
                        if (!admin) {
                            return reply(Boom.conflict('Unkown useranme or password'));
                        }
                        reply(admin);
                    });
                }
            }],
            handler: function (request, reply) {
                const admin = request.pre.adminCheck;
                cache.set(admin._id.toString(), {account: admin.username}, null, (err) => {
                    if (err) {
                        return reply(err);
                    }
                    request.auth.session.set({sid: admin._id, account: admin.username});
                    //return reply.redirect(request.query.next); // perform redirect
                    return reply.redirect('/admin');
                });
            },
            auth: {
                mode: 'try',
                strategy: 'admin'
            },
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            }
        }
    }, {
        method: 'GET',
        path: '/logout',
        config: {
            auth: false,
            handler: function (request, reply) {
                request.auth.session.clear();
                return reply.redirect('login');
            }
        }
    },{
        method: 'GET',
        path: '/register',
        handler: function(request, reply) {
            reply.view('register',{
                title: 'Registration - Gleimnet Administration',
                auth: true
            })
        }
    },{
        method: 'POST',
        path: '/register',
        config: {
            validate: {
                payload: {
                    username: Joi.string().token().lowercase().required(),
                    password: Joi.string().required(),
                    passwordSecond: Joi.string().required(),
                    submit: Joi.any().required()
                }
            },
            pre: [{
                assign: 'passwordCheck',
                method: function (request, reply) {
                    if(request.payload.password !== request.payload.passwordSecond) {
                        return reply(Boom.conflict('Password mismatch.'));
                    }
                    reply(true);
                }
            },{
                assign: 'usernameCheck',
                method: function (request, reply) {
                    const conditions = {
                        username: request.payload.username
                    };
                    Admin.findOne(conditions, (err, user) => {
                        if (err) {
                            return reply(err);
                        }
                        if (user) {
                            return reply(Boom.conflict('Username already in use.'));
                        }
                        reply(true);
                    });
                }
            }]
        },
        handler: function (request, reply) {
            Async.auto({
                admin: function (done) {
                    const username = request.payload.username;
                    const password = request.payload.password;
                    Admin.create(username, password, done);
                }
            }, (err, results) => {
                if (err) {
                    return reply(err);
                }

                const admin = results.admin;
                reply({
                    admin: {
                        _id: user._id,
                        username: user.username
                    }
                });
            });
        }
    },{
        method: 'POST',
        path: '/group/new',
        config: {
            validate: {
                payload: {
                    selectconfig: Joi.string().required(),
                    submitnewgroup: Joi.any().required()
                }
            },
            pre: [{
                assign: 'clean',
                method: function (request, reply) {
                    const User = server.plugins['hapi-mongo-models'].User;
                    const Friend = server.plugins['hapi-mongo-models'].Friend;
                    const Session = server.plugins['hapi-mongo-models'].Session;
                    const AuthAttempt = server.plugins['hapi-mongo-models'].AuthAttempt;
                    const Message = server.plugins['hapi-mongo-models'].Message;
                    const Conversation = server.plugins['hapi-mongo-models'].Conversation;
                    Async.auto({
                        clean: (done) => {
                            Async.parallel([
                                User.deleteMany.bind(User, {}),
                                Session.deleteMany.bind(Session, {}),
                                AuthAttempt.deleteMany.bind(AuthAttempt, {}),
                                Message.deleteMany.bind(Message, {}),
                                Conversation.deleteMany.bind(Conversation, {}),
                                Friend.deleteMany.bind(Friend, {})
                            ], done);
                        },
                        loadconfig: (done, data) => {
                            const fsOptions = { encoding: 'utf-8' };
                            Fs.readFile(Path.join(__dirname,'..','..','..','data','config',request.payload.selectconfig),fsOptions, (err, data) => {
                                if (err) {
                                    console.error('Failed to load data.');
                                    return done(err);
                                }
                                return done(null,data);
                            });
                        },
                        user: ['clean','loadconfig', (done, data) => {
                            const loaddata = EJSON.parse(data.loadconfig);
                            if (loaddata['users'].length === 0) {
                                return done;
                            }
                            User.insertMany(loaddata['users'],(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return results;
                            });
                            return done;
                        }],
                        friend: ['clean','loadconfig', (done, data) => {
                            const loaddata = EJSON.parse(data.loadconfig);
                            if (loaddata['friends'].length === 0) {
                                return done;
                            }
                            Friend.insertMany(loaddata['friends'],(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return results;
                            });
                            return done;
                        }],
                        message: ['clean','loadconfig', (done, data) => {
                            const loaddata = EJSON.parse(data.loadconfig);
                            if (loaddata['messages'].length === 0) {
                                return done;
                            }
                            Message.insertMany(loaddata['messages'],(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return results;
                            });
                            return done;
                        }],
                        conversation: ['clean','loadconfig', (done, data) => {
                            const loaddata = EJSON.parse(data.loadconfig);
                            if (loaddata['conversations'].length === 0) {
                                return done;
                            }
                            Conversation.insertMany(loaddata['conversations'],(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return results;
                            });
                            return done;
                        }]
                    }, (err, data) => {
                        if (err) {
                            console.error('Failed to setup root user.'+err);
                            return (err);
                        }
                        return(null, data);
                    });
                    reply(true);
                }
            }]
        },
        handler: function (request, reply) {
            return reply.redirect('/admin'); // perform redirect
        }
    },{
        method: 'POST',
        path: '/group/save',
        config: {
            validate: {
                payload: {
                    institution: Joi.string().required(),
                    groupname: Joi.string().required(),
                    submitsavegroup: Joi.any().required()
                }
            },
            pre: [{
                assign: 'save',
                method: function (request, reply) {
                    const User = server.plugins['hapi-mongo-models'].User;
                    const Friend = server.plugins['hapi-mongo-models'].Friend;
                    const Message = server.plugins['hapi-mongo-models'].Message;
                    const Conversation = server.plugins['hapi-mongo-models'].Conversation;
                    Async.auto({
                        loadUserdata: (done) => {
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
                        loadFriends: (done) => {
                            Friend.find({}, (err, data) => {
                                if (err) {
                                    return err;
                                }
                                return done(null, data);
                            });
                        },
                        savegroup: ['loadUserdata','loadFriends','loadMessages','loadConversations', (done, data) => {
                            const alldata = {};
                            alldata.users = data.loadUserdata;
                            alldata.messages = data.loadMessages;
                            alldata.conversations = data.loadConversations;
                            alldata.friends = data.loadFriends;
                            const savedata = EJSON.stringify(alldata,null, '\t');
                            const fsOptions = {encoding: 'utf-8'};
                            const date = new Date();
                            const filename = request.payload.institution+"_"+request.payload.groupname + "-" + date.toLocaleDateString('de-DE') + ".json";
                            Fs.writeFile(Path.join(__dirname, '..', '..', '..', 'data', 'saved', filename), savedata, fsOptions, (err) => {
                                if (err) throw err;
                                console.log('It\'s saved!');
                            });
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
            return reply.redirect('/admin'); // perform redirect
        }
    },{
        method: 'POST',
        path: '/group/load',
        config: {
            validate: {
                payload: {
                    selectloadgroup: Joi.string().required(),
                    submitloadgroup: Joi.any().required()
                }
            },
            pre: [{
                assign: 'clean',
                method: function (request, reply) {
                    const User = server.plugins['hapi-mongo-models'].User;
                    const Friend = server.plugins['hapi-mongo-models'].Friend;
                    const Session = server.plugins['hapi-mongo-models'].Session;
                    const AuthAttempt = server.plugins['hapi-mongo-models'].AuthAttempt;
                    const Message = server.plugins['hapi-mongo-models'].Message;
                    const Conversation = server.plugins['hapi-mongo-models'].Conversation;
                    Async.auto({
                        clean: (done) => {
                            Async.parallel([
                                User.deleteMany.bind(User, {}),
                                Session.deleteMany.bind(Session, {}),
                                AuthAttempt.deleteMany.bind(AuthAttempt, {}),
                                Message.deleteMany.bind(Message, {}),
                                Conversation.deleteMany.bind(Conversation, {}),
                                Friend.deleteMany.bind(Friend, {})
                            ], done);
                        },
                        loadconfig: (done, data) => {
                            const fsOptions = { encoding: 'utf-8' };
                            Fs.readFile(Path.join(__dirname,'..','..','..','data','saved',request.payload.selectloadgroup),fsOptions, (err, data) => {
                                if (err) {
                                    console.error('Failed to load data.');
                                    return done(err);
                                }
                                return done(null,data);
                            });
                        },
                        user: ['clean','loadconfig', (done, data) => {
                            const loaddata = EJSON.parse(data.loadconfig);
                            if (loaddata['users'].length === 0) {
                                return done;
                            }
                            User.insertMany(loaddata['users'],(err, results) =>{
                                if (err) {
                                    console.error(err);
                                    return err;
                                }
                                return results;
                            });
                            return done;
                        }],
                        friend: ['clean','loadconfig', (done, data) => {
                            const loaddata = EJSON.parse(data.loadconfig);
                            if (loaddata['friends'].length === 0) {
                                return done;
                            }
                            Friend.insertMany(loaddata['friends'],(err, results) =>{
                                if (err) {
                                    return err;
                                }
                                return results;
                            });
                            return done;
                        }],
                        message: ['clean','loadconfig', (done, data) => {
                            const loaddata = EJSON.parse(data.loadconfig);
                            if (loaddata['messages'].length === 0) {
                                return done;
                            }
                            Message.insertMany(loaddata['messages'],(err, results) =>{
                                if (err) {
                                    return err;
                                }
                                return results;
                            });
                            return done;
                        }],
                        conversation: ['clean','loadconfig', (done, data) => {
                            const loaddata = EJSON.parse(data.loadconfig);
                            if (loaddata['conversations'].length === 0) {
                                return done;
                            }
                            Conversation.insertMany(loaddata['conversations'],(err, results) =>{
                                if (err) {
                                    return err;
                                }
                                return results;
                            });
                            return done;
                        }]
                    }, (err, data) => {
                        if (err) {
                            console.error('Failed to setup root user.'+err);
                            return (err);
                        }
                        return(data);
                    });
                    reply(true);
                }
            }]
        },
        handler: function (request, reply) {
            return reply.redirect('/admin'); // perform redirect
        }
    }
    ]);
    next();
};

exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models','hapi-auth-cookie'], internals.applyRoutes);
    next();
};

exports.register.attributes = {
    name: 'admin'
};