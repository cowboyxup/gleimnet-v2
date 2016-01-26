'use strict';

const Joi = require('joi');
const Async = require('async');
const Bcrypt = require('bcryptjs');
const ObjectAssign = require('object-assign');
const BaseModel = require('hapi-mongo-models').BaseModel;


const User = BaseModel.extend({
    constructor: function (attrs) {
        ObjectAssign(this, attrs);
    }
});

User._collection = 'users';

User.schema = Joi.object().keys({
    _id: Joi.object(),
    isActive: Joi.boolean().default(true),
    username: Joi.string().token().lowercase().required(),
    password: Joi.string().required(),
    timeCreated: Joi.date().required(),
    givenName: Joi.string().required(),
    birthdate: Joi.date().required(),
    description: Joi.string(),

});

User.indexes = [
    { key: { username: 1, unique: true } },
];

User.generatePasswordHash = function (password, callback) {
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
        callback(null, {
            password: password,
            hash: results.hash
        });
    });
};

User.generateBirthdate = function(birthdate, callback) {
    Async.auto({
        date: function (results) {
            const dateArray = birthdate.trim().split("-");
            console.log(dateArray);
            const dateObj = new Date(dateArray[2], (dateArray[1]-1), dateArray[0],6,0,0);
            results(null, dateObj);
        }
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        console.log(results.date);
        callback(null, results.date);
    });
};

User.create = function (username, password, givenName, birthdate, description, callback) {
    const self = this;
    Async.auto({
        passwordHash: this.generatePasswordHash.bind(this, password),
        birth: this.generateBirthdate.bind(this, birthdate),
        newUser: ['passwordHash','birth', function (done, results) {
            const document = {
                isActive: true,
                username: username.toLowerCase(),
                password: results.passwordHash.hash,
                timeCreated: new Date(),
                givenName: givenName,
                birthdate: results.birth,
                description: description
            };
            self.insertOne(document, done);
        }]
    }, (err, results) => {
        if (err) {
            return callback(err);
        }
        results.newUser[0].password = results.passwordHash.password;
        callback(null, results.newUser[0]);
    });
};

User.findByCredentials = function (username, password, callback) {
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
        callback();
    });
};


User.findByUsername = function (username, callback) {
    const query = { username: username.toLowerCase() };
    this.findOne(query, callback);
};

module.exports = User;