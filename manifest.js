'use strict';
const Confidence = require('confidence');
const Config = require('./config');

const criteria = {
    env: process.env.NODE_ENV
};
const defaultContext = {
    title: 'Gleimnet Administration',
    auth: false
};

const manifest = {
    $meta: 'This file defines the plot device.',
    server: {
        debug: {
            request: ['error']
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/web'),
        labels: ['web']
    }],
    plugins: {
        'hapi-auth-basic': {},
        'hapi-auth-cookie': {},
        'lout': {},
        'inert': {},
        'vision': {},
        'good' : {
          reporters: [{
              reporter: require('good-console'),
                  events: {
                      response: '*',
                      log: '*'
                  }
          }]
        },
        'visionary': {
            engines: {
                html: 'ejs'
            },
            relativeTo: __dirname,
            path: './server/web/admin',
            layout: true,
            layoutPath: './server/web/admin/layout',
            helpersPath: './server/web/admin/helpers',
            partialsPath: './server/web/admin/views/partials',
            context: defaultContext
        },
        'hapi-mongo-models': {
            mongodb: Config.get('/hapiMongoModels/mongodb'),
            models: {
                AuthAttempt: './server/models/auth-attempt',
                Session: './server/models/session',
                User: './server/models/user',
                Admin: './server/models/admin'
            },
            autoIndex: Config.get('/hapiMongoModels/autoIndex')
        },
        './server/auth': {},
        './server/api/index': [{ routes: { prefix: '/api' } }],
        './server/api/login': [{ routes: { prefix: '/api' } }],
        './server/api/logout': [{ routes: { prefix: '/api' } }],
        './server/api/users': [{ routes: { prefix: '/api' } }],
        './server/web/admin/admin': [{ routes: { prefix: '/admin' } }],
        './server/web/index': {}
    }
};

const store = new Confidence.Store(manifest);

exports.get = function (key) {
    return store.get(key, criteria);
};


exports.meta = function (key) {
    return store.meta(key, criteria);
};
