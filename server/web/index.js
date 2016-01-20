'use strict';

exports.register = function (server, options, next) {
    // static route
    server.route({
        method: 'GET',
        path: '/{param*}',
        config: {
            auth: false,
            handler: {
                directory: {
                    path: 'public'
                }
            }
        }
    });
    next();
};

exports.register.attributes = {
    name: 'home',
    dependencies: 'visionary'
};
