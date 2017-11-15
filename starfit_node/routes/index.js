var express = require('express');
var router = express.Router();

var Users = require('../models/users');

/* GET home page. */

var search_test = {
    isSearch : true,
    results : [[{status:'busy',fullstar:4,halfstar:1,emptystar:0},{status:'busy',fullstar:3,halfstar:1,emptystar:1},'c'],[{status:'avaliable',fullstar:5,halfstar:0,emptystar:0},'e','f'],['g']],
    results_count : 7
};

router.get('/', function(req, res, next) {
  console.log(req.session.views);
  if (req.session.views) {
    req.session.views++;
  }
  else {
    req.session.views = 1;
  }
  res.render('index', { title: 'Index/login', style: 'style'});
  // res.render('view', { title: 'Index/Login', layout: 'login' });
});

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        //if login go home
        res.send(req.session.user);
    } else {
        next();
    }
};

// signup
router.post('/signup', function (req, res) {
    // add new user to db
    var newuser = {
      uid : req.body.uid,
      email : req.body.email,
      address : req.body.address,
      fname : req.body.fname,
      lname : req.body.lname,
      password : req.body.password
    };
    Users.create(newuser).then(user => {
        req.session.user = user;
        console.log(user);
        res.redirect('/');

    }).catch(error => {
        res.status(500).send({ error: 'something blew up during signup' });
        console.log("signup error");
    });
});

//login
router.post('/signin', function (req, res){
    var email = req.body.email,
        password = req.body.password;
    //find one in db
    Users.findOne({'email' : email}).then(function (user) {
      console.log(user);
      console.log("password " , password);
      console.log("correct pw " , user.password);
      if (!user) {
          console.log("user not found");
          //user not found
          res.send("user not found");
      } else if (user.password != password) {
          console.log("wrong pw");
          //wrong pw
          res.send("wrong pw");
      } else {
          //login sucssessful
          req.session.user = user;
          res.render('index', { title: 'Index/login', style: 'style', account:{isLogin:true,id:1}});
          // res.send("login sucssessful");
          // res.redirect('/');
      }
    });
    console.log("session ",req.session);
});

router.get('/signout', function (req, res, next) {
  console.log("session ",req.session);
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
        console.log("session ",req.session);
        // return res.send("log out complete");
      }
    });
  }
});

module.exports = router;
