#!/usr/bin/env node
'use strict';

const Async = require('async');
const Promptly = require('promptly');
const Mongodb = require('mongodb');
const Config = require('./../config/config');

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
    username: ['testMongo', (done, results) => {
        Promptly.prompt('User name:', { default: null }, done);
    }],
    password: ['username', (done, results) => {
        Promptly.password('User password:', { default: null }, done);
    }],
    givenName: ['password', (done, results) => {
        Promptly.prompt('Vorname(n):', { default: null }, done);
    }],
    surename: ['givenName', (done, results) => {
        Promptly.prompt('Nachname:', { default: null }, done);
    }],
    nickname: ['surename', (done, results) => {
        Promptly.prompt('Kurz- oder Spitzname:', { default: null }, done);
    }],
    birthdate: ['nickname', (done, results) => {
        Promptly.prompt('Geburtsdatum im Format: DD-MM-YYYY', { default: '' }, done);
    }],
    description: ['birthdate', (done, results) => {
        Promptly.prompt('Informationstext', { default: '' }, done);
    }],
    avatar: ['description', (done, results) => {
        Promptly.prompt('Profilbild Pfad relativ zu public', { default: null }, done);
    }],
    titlePicture: ['avatar', (done, results) => {
        Promptly.prompt('Titel Bild Pfad relativ zu public', { default: null }, done);
    }],
    tags: ['titlePicture', (done, results) => {
        Promptly.prompt('Maximal 5 Tags im Format [tag1,tag2,tag3,tag4,tag5]', { default: [] }, done);
    }],
    birthplace: ['tags', (done, results) => {
        Promptly.prompt('Geburtsort', { default: '' }, done);
    }],
    influenceplace: ['birthplace', (done, results) => {
        Promptly.prompt('Wirkungsort', { default: '' }, done);
    }],
    setupUsers: ['influenceplace', (done, results) => {
        const BaseModel = require('hapi-mongo-models').BaseModel;
        const User = require('../server/models/user');
        Async.auto({
            connect: (done) => {
                BaseModel.connect({url: mongodbUrl}, done);
            },
            user: ['connect', (done, dbResults) => {
                User.create(
                    results.username,
                    results.password,
                    results.givenName,
                    results.surename,
                    results.nickname,
                    results.birthdate,
                    results.description,
                    results.avatar,
                    results.titlePicture,
                    results.tags,
                    results.birthplace,
                    results.influenceplace,
                    done);
            }]
        }, (err, dbResults) => {
            if (err) {
                console.error('Failed to create user.');
                return done(err);
            }
            console.log('User created');
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