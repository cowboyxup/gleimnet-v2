'use strict';

var jetpack = require('fs-jetpack');

const internals = {};

internals.applyRoutes = function (server, next) {

    server.route({
        method: 'GET',
        path: '/setups',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'admin'
            },
            pre: [{
                assign: 'listSetupFiles',
                method: function (request, reply) {
                    const files = jetpack.dir('./data/setups').find('./', {
                        matching: '*.json'
                    },'relativePath');
                    return reply(files);
                }
            }
            ]
        },
        handler: function (request, reply) {
            const files = request.pre.listSetupFiles.map(function (item){return ({path: item}) });
            const tmp = {
                files: files
            };
            return reply(tmp);
        }
    });
    next();
};
exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models'], internals.applyRoutes );
    next();
};
exports.register.attributes = {
    name: 'adminSetups'
};