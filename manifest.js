'use strict';

const Confidence = require('confidence');
const Glue = require('glue');
const Config = require('./config');

const criteria = {
    env: process.env.NODE_ENV
};

const manifest = {
    server: {
    },
    connections: [
        {
            port:  Config.get('/port/web'),
            labels: ['web']
        }
    ],
    registrations: [
        {
            plugin: {
                register: 'good',
                options: {
                    reporters: [{
                        reporter: require('good-console'),
                        events: {
                            response: '*',
                            log: '*'
                        }
                    }]
                }
            }
        },
        {
            plugin: {
                register: 'hapi-mongo-models',
                options: {
                    mongodb: Config.get('/hapiMongoModels/mongodb'),
                    models: {
                        User: './server/models/user',
                    },
                    autoIndex: Config.get('/hapiMongoModels/autoIndex')
                }
            }
        },
        {
            plugin: {
                register: './server/api/v1/index',
                options: {
                }
            },
            options: {
                select: ['web'],
                routes: {
                    prefix: '/api/v1'
                }
            }
        }
    ]
};

const store = new Confidence.Store(manifest);

exports.get = function (key) {
    return store.get(key, criteria);
};


exports.meta = function (key) {
    return store.meta(key, criteria);
};