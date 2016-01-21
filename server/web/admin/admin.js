'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Async = require('async');

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
        redirectTo: 'admin/login',
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
            pre: [],
            handler: function(request, reply) {
                reply.view('index',{
                    title: 'Gleimnet Administration',
                    auth: true
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
                        return reply.redirect('/admin/');
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
    }]);
    next();
};

exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models','hapi-auth-cookie'], internals.applyRoutes);
    next();
};

exports.register.attributes = {
    name: 'admin'
};