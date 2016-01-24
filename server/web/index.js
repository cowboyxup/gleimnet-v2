'use strict';

exports.register = function (server, options, next) {
    // static route


    server.route([{
        method: 'GET',
        path: '/node_modules/{param*}',
        config: {
            auth: false,
            handler: {
                directory: {
                    path: 'node_modules'
                }
            }
        }
    },{
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
    }]);

    next();


};

exports.register.attributes = {
    name: 'home',
    dependencies: 'visionary'
};
