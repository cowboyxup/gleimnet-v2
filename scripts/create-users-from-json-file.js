#!/usr/bin/env node
'use strict';

const Async = require('async');
const Promptly = require('promptly');
const Mongodb = require('mongodb');
const Config = require('./../config/config');
const jetpack = require('fs-jetpack');

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
    file: ['testMongo', (done, results) => {
        Promptly.prompt('File Path', { default: '' }, done);
    }],
    connect: ['file', (done, results) => {
        const BaseModel = require('hapi-mongo-models').BaseModel;
        BaseModel.connect({url: mongodbUrl}, done);
    }],
    setupUser: ['connect', (done, results) => {
        const BaseModel = require('hapi-mongo-models').BaseModel;
        const User = require('../server/models/user');
        const file = jetpack.dir('..').read(results.file, 'json');
        const data = file.data;
        Async.each(data, function(item, res) {
            User.create(
                item.username,
                item.password,
                item.vorname,
                item.nachname,
                item.anzeigename,
                null,
                '',
                item.avatar,
                item.cover,
                [],
                '',
                '',
                res);
        }, (err) => {
            if (err) {
                console.error('Failed to create user.');
                return done(err);
            }
            else {
                return done(null,true);
            }
        });
    }]}
    ,(err, results) => {
    if (err) {
        console.error('Setup failed.');
        console.error(err);
        return process.exit(1);
    }
    console.log('Setup complete.');
    process.exit(0);
});