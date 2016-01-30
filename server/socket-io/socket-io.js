
const internals = {};

// https://www.npmjs.com/package/socketio-auth

internals.applyRoutes = function (server, next) {
    const Session = server.plugins['hapi-mongo-models'].Session;
    const io = require('socket.io').listen(server.listener);


    const auth = function (socket, data, callback) {
        //get credentials sent by the client
        var authBasic = data.auth;

        const credentialsPart = new Buffer(authBasic, 'base64').toString();
        const sep = credentialsPart.indexOf(':');

        const username = credentialsPart.slice(0, sep);
        const password = credentialsPart.slice(sep + 1);

        Session.findByCredentials(username, password, (err, session) => {

            //inform the callback of auth success/failure
            if (err || !session) {
                return callback(new Error('User unauthenticated'));
            }
            return callback(null, session);
        });
    };

    const postAuth = function postAuthenticate(socket, data) {
    };

    const ioAuth = require('socketio-auth')(io, {
        authenticate: auth,
        postAuthenticate: postAuth,
        timeout: 1000
    });

    io.sockets.on('authenticated', function(socket){
        console.log('Wait.....');
        socket.join('some room');
    });

    next();
};


exports.register = function (server, options, next) {
    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);
    next();
};


exports.register.attributes = {
    name: 'socketIO'
};
