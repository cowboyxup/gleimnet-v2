'use strict';
const PassThrough = require('stream').PassThrough;


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
            const stream = new PassThrough({ objectMode: true });
            setInterval(() => {

                stream.write({ name: 'BDGRS', price: (500 + Math.floor(Math.random() * 100)).toString(), order: Math.floor(Math.random() * 2) === 1 ? 'BUY' : 'SELL' });
                stream.write({ name: 'MSHRM', price: (120 + Math.floor(Math.random() * 200)).toString(), order: Math.floor(Math.random() * 2) === 1 ? 'BUY' : 'SELL' });
                stream.write({ name: 'ASNKE', price: (900 + Math.floor(Math.random() * 50)).toString(), order: Math.floor(Math.random() * 2) === 1 ? 'BUY' : 'SELL' });
            }, 200);
            return reply.event(stream, null, { event: 'stock' });
            //return reply({ message: 'Welcome to the plot device.' });
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