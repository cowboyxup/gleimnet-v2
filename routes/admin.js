var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();


router.get('/', function (req, res) {
  res.render('admin/index', {
    user : req.user,
    title : "Administration"
  });
});

router.get('/register', function(req, res) {
  res.render('admin/register', {
    title : "Administration"
  });
});

router.post('/register', function(req, res) {
  Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
    if (err) {
      return res.render('admin/register', {
        account : account,
        title : "Administration"
      });
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/admin/', {
        title : "Administration"
      });
    });
  });
});

router.get('/login', function(req, res) {
  res.render('admin/login', {
    user : req.user,
    title : "Login - Administration"
  });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/admin/');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/admin/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});

module.exports = router;