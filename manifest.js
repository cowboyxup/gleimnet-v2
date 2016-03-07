'use strict';

const Confidence = require('confidence');
const Glue = require('glue');
const Path = require('path');
const Config = require('./config/config');

const criteria = {
    env: process.env.NODE_ENV
};

const manifest = {
    server: {
        debug: {
            request: ['error']
        }
    },
    connections: [
        {
            port:  Config.get('/port/web'),
            labels: ['web'],
            routes: {
                files: {
                    relativeTo: Path.join(__dirname, 'server/web/public')
                }
            }
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
                register: 'inert',
                options: {
                }
            }
        },
        {
            plugin: {
                register: 'hapi-auth-jwt2',
                options: {
                }
            }
        },
        {
            plugin: {
                register: 'hapi-mongo-models',
                options: {
                    mongodb: Config.get('/hapiMongoModels/mongodb'),
                    models: {
                        Admin: './server/models/admin',
                        User: './server/models/user',
                        Timeline: './server/models/timeline',
                        Post: './server/models/post',
                        Comment: './server/models/comment',
                    },
                    autoIndex: Config.get('/hapiMongoModels/autoIndex')
                }
            }
        },
        {
            plugin: {
                register: './server/api/v1/auth',
                options: {
                }
            },
            options: {
                select: ['web'],
                routes: {
                    prefix: '/api/v1'
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
        },
        {
            plugin: {
                register: './server/api/v1/profile',
                options: {
                }
            },
            options: {
                select: ['web'],
                routes: {
                    prefix: '/api/v1'
                }
            }
        },
        {
            plugin: {
                register: './server/web/index.js',
                options: {
                }
            },
            options: {
                select: ['web']
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