'use strict';

const Joi = require('joi');
const Async = require('async');
const Bcrypt = require('bcryptjs');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;


const Admin = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
});

Admin._collection = 'admins';

Admin.schema = Joi.object().keys({
    _id: Joi.object(),
    isActive: Joi.boolean().default(true),
    username: Joi.string().token().lowercase().required(),
    password: Joi.string(),
    timeCreated: Joi.date()
});

Admin.indexes = [
    { key: { username: 1, unique: true } },
];

Admin.generatePasswordHash = function (password, callback) {
    Async.auto({
        salt: function (done) {
            Bcrypt.genSalt(10, done);
        },
        hash: ['salt', function (done, results) {
            Bcrypt.hash(password, results.salt, done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        return callback(null, {
            password: password,
            hash: results.hash
        });
    });
};

Admin.create = function (username, password, callback) {
    const self = this;
    Async.auto({
        passwordHash: this.generatePasswordHash.bind(this, password),
        newAdmin: ['passwordHash', function (done, results) {
            const document = {
                isActive: true,
                username: username.toLowerCase(),
                password: results.passwordHash.hash,
                timeCreated: new Date()
            };
            self.insertOne(document, done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        results.newAdmin[0].password = results.passwordHash.password;
        return callback(null, results.newAdmin[0]);
    });
};

Admin.findByCredentials = function (username, password, callback) {
    const self = this;
    Async.auto({
        user: function (done) {
            const query = {
                isActive: true
            };
            query.username = username.toLowerCase();
            self.findOne(query, done);
        },
        passwordMatch: ['user', function (done, results) {
            if (!results.user) {
                return done(null, false);
            }
            const source = results.user.password;
            Bcrypt.compare(password, source, done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        if (results.passwordMatch) {
            return callback(null, results.user);
        }
        return callback();
    });
};

Admin.findByAdminname = function (username, callback) {
    const query = { username: username.toLowerCase() };
    this.findOne(query, callback);
};

module.exports = Admin;