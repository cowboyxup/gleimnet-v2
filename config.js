'use strict';

const Confidence = require('confidence');


const criteria = {
    env: process.env.NODE_ENV
};


const config = {
    $meta: 'This file configures the plot device.',
    projectName: 'Gleimnet',
    port: {
        web: {
            $filter: 'env',
            test: 9000,
            $default: 8000
        }
    },
    authAttempts: {
        forIp: 50,
        forIpAndUser: 7
    },
    hapiMongoModels: {
        $filter: 'env',
        production: {
            mongodb: {
                url: process.env.MONGOLAB_URI
            },
            autoIndex: false
        },
        test: {
            mongodb: {
                url: 'mongodb://localhost:27017/gleimnet-test'
            },
            autoIndex: true
        },
        $default: {
            mongodb: {
                url: 'mongodb://localhost:27017/gleimnet'
            },
            autoIndex: true
        }
    },
};


const store = new Confidence.Store(config);


exports.get = function (key) {
    return store.get(key, criteria);
};


exports.meta = function (key) {
    return store.meta(key, criteria);
};
