#!/usr/bin/env node
'use strict';

const Fs = require('fs');
const Path = require('path');
const Async = require('async');
const Promptly = require('promptly');
const Mongodb = require('mongodb');
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
    conversationId: ['testMongo', (done, results) => {
        Promptly.prompt('Conversation Id', { default: null }, done);
    }],
    messageId: ['conversationId', (done, results) => {
        Promptly.prompt('Message Id', { default: null }, done);
    }],
    username: ['messageId', (done, results) => {
        Promptly.prompt('Username', { default: null }, done);
    }],
    setupUser: ['username', (done, results) => {
        const BaseModel = require('hapi-mongo-models').BaseModel;
        const Conversation = require('hapi-mongo-models').Conversation;
        const User = require('./server/models/user');
        Async.auto({
            connect: (done) => {
                BaseModel.connect({url: mongodbUrl}, done);
            },
            conversionf: ['connect', (done, dbResults) => {
                console.log(dbResults);
                Conversation.findById(results.conversationId, dbResults);
            }],
            message: ['conversionf', (done, dbResults) => {
                console.log("d");
                //dbResults.conversionf.addMessage(results.username, results.messageID, done);
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