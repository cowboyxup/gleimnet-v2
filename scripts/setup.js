#!/usr/bin/env node
'use strict';

const Fs = require('fs');
const Path = require('path');
const Async = require('async');
const Promptly = require('promptly');
const Mongodb = require('mongodb');
const Handlebars = require('handlebars');


const configTemplatePath = Path.resolve(__dirname, 'config.example');
const configPath = Path.resolve(__dirname, 'config.js');


if (process.env.NODE_ENV === 'test') {
    const options = { encoding: 'utf-8' };
    const source = Fs.readFileSync(configTemplatePath, options);
    const configTemplateTest = Handlebars.compile(source);
    const context = {
        projectName: 'Gleimnet',
        mongodbUrl: 'mongodb://localhost:27017/gleimnet',
        rootPassword: 'root',
    };
    Fs.writeFileSync(configPath, configTemplateTest(context));
    console.log('Setup complete.');
    process.exit(0);
}

Async.auto({
    projectName: (done) => {
        Promptly.prompt('Project name: (Gleimnet)', { default: 'Gleimnet' }, done);
    },
    mongodbUrl: ['projectName', (done, results) => {
        const promptOptions = {
            default: 'mongodb://localhost:27017/gleimnet'
        };
        Promptly.prompt('MongoDB URL: (mongodb://localhost:27017/gleimnet)', promptOptions, done);
    }],
    testMongo: ['rootPassword', (done, results) => {
        Mongodb.MongoClient.connect(results.mongodbUrl, {}, (err, db) => {
            if (err) {
                console.error('Failed to connect to Mongodb.');
                return done(err);
            }
            db.close();
            done(null, true);
        });
    }],
    rootPassword: ['mongodbUrl', (done, results) => {
        Promptly.password('Root user password:', { default: null }, done);
    }],
    createConfig: ['testMongo', (done, results) => {
        const fsOptions = { encoding: 'utf-8' };
        Fs.readFile(configTemplatePath, fsOptions, (err, src) => {
            if (err) {
                console.error('Failed to read config template.');
                return done(err);
            }
            const configTemplate = Handlebars.compile(src);
            Fs.writeFile(configPath, configTemplate(results), done);
        });
    }],
    setupRootUser: ['createConfig', (done, results) => {
        const BaseModel = require('hapi-mongo-models').BaseModel;
        const Admin = require('./server/models/admin');
        Async.auto({
            connect: (done) => {
                BaseModel.connect({ url: results.mongodbUrl }, done);
            },
            clean: ['connect', (done) => {
                Async.parallel([
                    Admin.deleteMany.bind(Admin, {}),
                ], done);
            }],
            user: ['clean', (done, dbResults) => {
                Admin.create('root', results.rootPassword, done);
            }]
        }, (err, dbResults) => {
            if (err) {
                console.error('Failed to setup root user.');
                return done(err);
            }
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