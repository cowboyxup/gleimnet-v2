
const internals = {};

// https://www.npmjs.com/package/socketio-auth

internals.applyRoutes = function (server, next) {
    const io = require('socket.io')(server.listener, {
        serveClient: false,
        path: "/socketpath",
        log: true
    });
    io.on("connection", function (socket) {
        console.log("client incoming");
    });
    io.use(function (socket, next) {
        var cookies = socket.request.headers.cookie;
        server.select("<your descriptive server label>").connections[0].states.parse(cookies, function (err, state, failed) {
            //if no session is set, connection will be refused
            if (!state.session) {
                return next(new Error("Cookie not found"));
            }
            //first we get the arangodb channel to request a connection
            var channel = server.methods.intercom.getChannel("arangodb");
            //now we are requesting a connection from the connection pool
            //everything from here on is a promise to ease asynchronous data flow ;)
            channel.request("connection").then(function (conn) {
                //we request the session from the database
                return conn.foxx(options.foxxName, "session/" + state.session.id).get({});
            }).then(function (result) {
                //the session object is stored under data in the response
                var session = result.data;
                //if the userid is not set, we are not authenticated
                if (!session.uid) {
                    return next(new Error("Session is not authenticated"));
                }
                //everything is fine, session is authenticated and we accept the
                //connection
                next();
            }).catch(function (err) {
                //if any error is thrown during the authentication process, we log the
                //error and refuse authentication
                server.log(["socket", "error", "authentication"], {
                    error: err,
                    message: "Error during socket authentication for conversation channel"
                });
                return next(err);
            });
        });
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
