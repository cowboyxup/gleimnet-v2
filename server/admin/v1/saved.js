'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Async = require('async');
const jetpack = require('fs-jetpack');
const EJSON = require('mongodb-extended-json');

const internals = {};

internals.applyRoutes = function (server, next) {

    server.route({
        method: 'GET',
        path: '/saved',
        config: {
            tags: ['api'],
            auth: {
                strategy: 'admin'
            },
            pre: [{
                assign: 'listSavedFiles',
                method: function (request, reply) {
                    const files = jetpack.dir('./data/saved').find('./', {
                        matching: '*.json'
                    },'relativePath');
                    return reply(files);
                }
            }
            ]
        },
        handler: function (request, reply) {
            const files = request.pre.listSavedFiles.map(function (item){return ({path: item}) });
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
    name: 'adminSaved'
};