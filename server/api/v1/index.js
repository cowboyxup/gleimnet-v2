'use strict';

const internals = {};

internals.applyRoutes = function (server, next) {

    server.route({
        method: 'GET',
        path: '/',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'jwt'
            }
        },
        handler: function (request, reply) {
            return reply({ message: 'Welcome to the plot device.' });
        }
    });
    next();
};
exports.register = function (server, options, next) {
    server.dependency(['hapi-mongo-models'], internals.applyRoutes );
    next();
};
exports.register.attributes = {
    name: 'index'
};