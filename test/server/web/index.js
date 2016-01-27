'use strict';

const Lab = require('lab');
const Code = require('code');
const Config = require('../../../config');
const Manifest = require('../../../manifest');
const Hapi = require('hapi');
const Vision = require('vision');
const Visionary = require('visionary');
const HomePlugin = require('../../../server/web/index');


const VisionaryPlugin = {
    register: Visionary,
    options: Manifest.get('/plugins/visionary')
};
const lab = exports.lab = Lab.script();
let request;
let server;


lab.beforeEach((done) => {

    const plugins = [Vision, VisionaryPlugin, HomePlugin];
    server = new Hapi.Server();
    server.connection({ port: Config.get('/port/web') });
    server.register(plugins, (err) => {

        if (err) {
            return done(err);
        }

        server.initialize(done);
    });
});


lab.experiment('Home Page View', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'GET',
            url: '/'
        };

        done();
    });



    lab.test('home page renders properly', (done) => {

        server.inject(request, (response) => {

            Code.expect(response.result).to.match(/activate the plot device/i);
            Code.expect(response.statusCode).to.equal(200);

            done();
        });
    });
});
