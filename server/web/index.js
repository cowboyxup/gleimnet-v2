'use strict';

const internals = {};

internals.applyRoutes = function (server, next) {
    server.route({
        method: 'GET',
        path: '/{param*}',
        config: {
            auth: false,
            handler: {
                directory: {
                    path: ['./','../favicons']
                }
            }
        }
    });
    next();
};
exports.register = function (server, options, next) {
    server.dependency(['inert'], internals.applyRoutes );
    next();
};

exports.register.attributes = {
    name: 'home'
};