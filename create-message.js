#!/usr/bin/env node
'use strict';

const Fs = require('fs');
const Path = require('path');
const Async = require('async');
const Promptly = require('promptly');
const Mongodb = require('mongodb');
const Handlebars = require('handlebars');
const Confidence = require('confidence');
const Config = require('./config');

const mongodbUrl = Config.get('/hapiMongoModels/mongodb/url');
console.log(mongodbUrl);
Async.auto({
    testMongo: (done, results) => {
        Mongodb.MongoClient.connect(mongodbUrl, {}, (err, db) => {
            if (err) {
                console.error('Failed to connect to Mongodb.');
                return done(err);
            }
            db.close();
            done(null, true);
        });
    },
    userid: ['testMongo', (done, results) => {
        Promptly.prompt('User ID', { default: null }, done);
    }],
    content: ['userid', (done, results) => {
        Promptly.prompt('Text', { default: null }, done);
    }],
    setupUser: ['content', (done, results) => {
        const BaseModel = require('hapi-mongo-models').BaseModel;
        const Message = require('./server/models/message');
        Async.auto({
            connect: (done) => {
                BaseModel.connect({url: mongodbUrl}, done);
            },
            user: ['connect', (done, dbResults) => {
                Message.create(results.userid, results.content, done);
            }]
        }, (err, dbResults) => {
            if (err) {
                console.error('Failed to create message.');
                return done(err);
            }
            console.log('Message created');
            done(null, true);
        });
    }]
}, (err, results) => {
    if (err) {
        console.error('Setup failed.');
        console.error(err);
        return process.exit(1);
    }
    console.log('Setup complete.');
    process.exit(0);
});
