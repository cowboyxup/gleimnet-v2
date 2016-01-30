const Async = require('async');

const internals = {};

// https://www.npmjs.com/package/socketio-auth

internals.applyRoutes = function (server, next) {

    const Session = server.plugins['hapi-mongo-models'].Session;
    const Conversation = server.plugins['hapi-mongo-models'].Conversation;
    const Message = server.plugins['hapi-mongo-models'].Message;

    var q = Async.queue(function (task, callback) {
        console.log('hello ' + task.name);
        callback();
    }, 2);


    const io = require('socket.io').listen(server.listener,
        {
            path:server.realm.modifiers.route.prefix
        }
    );


    const auth = function (socket, data, callback) {
        //get credentials sent by the client
        var authBasic = JSON.parse(data);
        const parts = authBasic.auth.split(/\s+/);

        const credentialsPart = new Buffer(parts[1], 'base64').toString();
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


    io.on('authenticated', function(data){
        console.log('Wait.....');
        socket.on('all-conversations', function(data) {
            Connection

        });

        socket.on('new-conversation', function (userId) {
            Conversation.create((err, newConversation) => {
                if(err) {
                    return new Error("Fehler");
                }
                newConversation.ensureAuthor(userId, (err, finish) => {
                    io.sockets.to(SocketId).send('conversation',finish);
                    return finish;
                });
                return newConversation;
            });
        })
        socket.on('join-conversation', function (conversation) {
            socket.join(conversation);
            socket.emit('message', 'for your eyes only');

            socket.on('new-message'), function(message) {
                Message.create(message.userid, message.content, (err, mes)=> {
                    Conversation.findById(conversation, (err,con) => {
                        con.addMessage(userIdm, mes._id.toString())
                        io.sockets.to(conversation).emit('message', message);
                        return message;
                    })
                });

                return mes;
            }
        })
    });

    server.route([
        {
            method: 'GET',
            path: '/socket.io',
            config: {
                auth: false,
                pre: []
            },
            handler: {
                file: './node_modules/socket.io-client/socket.io.js'
            }
        }
    ]);

    next();
};


exports.register = function (server, options, next) {
    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);
    next();
};


exports.register.attributes = {
    name: 'socketIO'
};
