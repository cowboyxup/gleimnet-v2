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
/*const manifest = {
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
    registrations: [
        {
            plugin: {
                register: 'hapi-auth-cookie',
                options: {
                }
            }
        }, {
            plugin: 'hapi-auth-basic',
            options: {
            }
        }, {
            plugin: 'lout',
            options: {
            }
        }, {
            plugin: 'inert',
            options: {
            }
        }, {
            plugin: 'vision',
            options: {
            }
        }, {
            plugin: 'good',
            options: {
                /*reporters: [{
                    reporter: require('good-console'),
                    events: {
                        response: '*',
                        log: '*'
                    }
                }]
            }
        }, {
            plugin: 'visionary',
            options: {
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
            }
        }, {
            plugin: 'hapi-mongo-models',
            options: {
                mongodb: Config.get('/hapiMongoModels/mongodb'),
                models: {
                    AuthAttempt: './server/models/auth-attempt',
                    Session: './server/models/session',
                    User: './server/models/user',
                    Admin: './server/models/admin',
                    Message: './server/models/message',
                    Conversation: './server/models/conversation'
                },
                autoIndex: Config.get('/hapiMongoModels/autoIndex')
            }
        }, {
            plugin: './server/auth',
            options: {
            }
        },{
            plugin: './server/api/index',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },{
            plugin: './server/api/login',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },{
            plugin: './server/api/logout',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },
        {
            plugin: './server/api/users',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },
        {
            plugin: './server/api/timeline',
            options: {
                routes: {
                    prefix: '/api'
                }
            }
        },
        {
            plugin: './server/web/admin/admin',
            options: {
                routes: {
                    prefix: '/admin'
                }
            }
        }, {
            plugin: './server/web/index',
            options: {
            }
        }

    ]
};*/
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
                Admin: './server/models/admin',
                Message: './server/models/message',
                Conversation: './server/models/conversation'
            },
            autoIndex: Config.get('/hapiMongoModels/autoIndex')
        },
        './server/auth': {},
        './server/api/index': [{ routes: { prefix: '/api' } }],
        './server/api/login': [{ routes: { prefix: '/api' } }],
        './server/api/logout': [{ routes: { prefix: '/api' } }],
        './server/api/users': [{ routes: { prefix: '/api' } }],
        './server/api/timeline': [{ routes: { prefix: '/api' } }],
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
