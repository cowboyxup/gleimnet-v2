'use strict';

const Boom = require('boom');
const Async = require('async');


const internals = {};


internals.applyStrategy = function (server, next) {

    const Session = server.plugins['hapi-mongo-models'].Session;
    const User = server.plugins['hapi-mongo-models'].User;

    server.auth.strategy('simple', 'basic', {
        validateFunc: function (request, username, password, callback) {
            Async.auto({
                session: function (done) {
                    Session.findByCredentials(username, password, done);
                },
                user: ['session', function (done, results) {
                    if (!results.session) {
                        return done();
                    }
                    User.findById(results.session.userId, done);
                }]
            }, (err, results) => {
                if (err) {
                    return callback(err);
                }
                if (!results.session) {
                    return callback(null, false);
                }
                callback(null, Boolean(results.user), results);
            });
        }
    });

    next();
};


exports.register = function (server, options, next) {
    server.dependency('hapi-mongo-models', internals.applyStrategy);
    next();
};

exports.register.attributes = {
    name: 'auth'
};
