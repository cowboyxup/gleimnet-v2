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
                    path: ['public', 'node_modules']
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
