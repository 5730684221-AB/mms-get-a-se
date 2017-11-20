var express = require('express');
var router = express.Router();

var Users = require('../models/users');
var Services = require('../models/services');

/* GET home page. */

// middleware function to check for logged-in users
var sessionChecker = function (req) {
  if (req.session.user) {
    //login
    return true;
  } else {
    return false;
  }
};

router.get('/', function (req, res, next) {
  console.log("req.session = ", req.session);
  console.log("res locals = ", res.locals);

  res.render('index', {
    title: 'Starfit',
    style: 'style'
  });
});

// signup
router.post('/signup', function (req, res) {
  // add new user to db
  var email = req.body.email.toLowerCase();
  var newuser = {
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    fname: req.body.fname,
    lname: req.body.lname,
    phone: req.body.phone

  };
  // if(req.body.password !== req.body.confirmPass){
  //   res.status(500).send({error: 'passwords do not match.'});
  //   console.log("passwords do not match");
  // }
  Users.getUserByE(email, (err, user) => {
    if (err) {
      console.log(err);
    }
    if (!user) {
      ////no user
      // res.send("user not found adding new user");
      Users.addUser(newuser, (err, user) => {
        if (err) {
          // res.status(500).send({ error: 'something blew up during signup' });
          req.flash('error', "Something blew up during signup.");
          res.redirect("/");
          console.log("signup error");
        }

        req.session.user = user;
        console.log(user);
        req.flash('success', "Signup successful.");

        var userdata = {
          id: user._id,
          email: user.email,
          fname: user.fname,
          lname: user.lname,
          phone: user.phone,
          image: user.image,
          trainer: user.trainer,
          reservations: user.reservations,
          login: true
        };
        console.log("userdata = ", userdata);
        req.session.user = userdata;
        res.redirect('/');

      });
    } else {
      console.log("Email is already in use");

      //res.status(200).send({ error: 'Email is already in use' });
      req.flash('error', "Email is already used.");
      res.redirect('/');
    }
  });
});

//login
router.post('/signin', function (req, res) {
  var email = req.body.email.toLowerCase(),
    password = req.body.password;
  //find one in db
  Users.getUserByE(email, (err, user) => {
    if (err) {
      console.log(err);
    }
    // console.log(user);
    // console.log('if' , !user);
    // console.log("password " , password);

    if (!user) {
      ////no user
      req.flash('error', "Incorrect email or password");
      res.redirect("/");
    } else if (user.password != password) {
      // console.log("correct pw " , user.password);
      console.log("wrong pw");
      //wrong pw
      req.flash('error', "Incorrect email or password");
      res.redirect("/");
    } else {
      //login sucssessful
      var userdata = {
        id: user._id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        phone: user.phone,
        image: user.image,
        trainer: user.trainer,
        reservations: user.reservations,
        login: true
      };
      console.log("userdata = ", userdata);
      req.flash('success', "Login is successful.");
      req.session.user = userdata;
      res.redirect('/');
    }
  });
  console.log("session ", req.session);
});

router.get('/signout', function (req, res, next) {
  console.log("session ", req.session);
  if (req.session) {
    // delete session object
    req.session = null
    res.redirect('/');
    console.log("session ", req.session);
  }
});

router.get('/profile/:id', function (req, res, next) {
  var profile_id = req.params.id;
  if (req.session.user) {
    if (req.session.user.id === profile_id) {
      var fullname = req.session.user.fname + " " + req.session.user.lname;
      res.render('profile', {
        title: 'Starfit ',
        style: 'style'
      });
    } else {
      req.flash('error', "You don't have permission.");
      res.render('index', {
        title: 'Starfit',
        style: 'style'
      });
    }
  } else {
    req.flash('error', "Please login.");
    res.render('index', {
      title: 'Starfit',
      style: 'style'
    });
  }
});

//update
router.post('/update', function (req, res, next) {
  if (sessionChecker(req)) {
    var id = req.session.user.id;
    updateUser = {};
    if (req.body.fname) {
      updateUser.fname = req.body.fname;
    }
    if (req.body.lname) {
      updateUser.lname = req.body.lname;
    }
    if (req.body.phone) {
      updateUser.phone = req.body.phone;
    }
    console.log("update user = ",updateUser);
    Users.updateUser(id, updateUser, null, (err, user) => {
      console.log("update");
      if (err) {
        console.log(err);
        req.flash('error', "Something error.");
      }
      req.session.user.fname = updateUser.fname;
      req.session.user.lname = updateUser.lname;
      req.session.user.phone = updateUser.phone;
      console.log("ession router = ",req.session.user);
      req.flash('success', "Update is successful.");
      res.redirect("/");
    });
  } else {
    req.flash('error', "Please login.");
    // res.redirect("/");
  }
});

router.get('/search', function (req, res, next) {
  console.log("query ", req.query);
  var query = {};
  if (req.query.searchfor !== '') query.name = {
    "$regex": req.query.searchfor,
    "$options": "i"
  };
  if (req.query.location !== '0') query.place = req.query.location;
  if (req.query.tag !== '0') query.ttype = req.query.tag;
  switch (req.query.price) {
    case '0':
      break;
    case '1':
      query.price = {
        $lte: 500
      };
      break;
    case '2':
      query.price = {
        $gte: 500,
        $lte: 1000
      };
      break;
    case '3':
      query.price = {
        $gte: 1000
      };
      break;
    default:
      break;
  }
  console.log('query2 ', query);
  Services.find(query).lean().exec(function (err, result) {
    console.log('result ', result);
    if (err) {
      console.error('err ', err);
      req.flash('error', "An error occurred.");
      return res.redirect('/');
      //return res.status(500).send("An error occurred.");
    }

    if (result.length <= 0) {
      console.log("result length < 0");
      req.flash('error', "No service found.");
      return res.redirect('/');
      //return res.status(404).send("No service found.");
    }

    var ret = {};
    ret.results = [];
    var newArray = [];

    //star calculator
    for (var i = 0; i < result.length; i++) {
      var rate = result[i].rating;
      result[i].fullstar = 0;
      result[i].halfstar = 0;
      while (rate > 1) {
        rate--;
        result[i].fullstar++;
      }
      if (rate > 0) {
        result[i].halfstar = 1;
      }
      result[i].emptystar = 5 - result[i].fullstar - result[i].halfstar;
    }

    //search result calculator
    for (var i = 0; i < result.length; i++) {
      if (i % 3 == 0) {
        newArray = [];
      }
      newArray.push(result[i]);
      if (i % 3 == 2) {
        ret.results.push(newArray);
      }
    }
    console.log("newArray ", newArray);
    if ((result.length % 3) > 0) {
      ret.results.push(newArray);
    }

    ret.isSearch = true;
    ret.results_count = result.length;
    console.log('ret ', ret);
    //res.status(200).send(ret);
    res.render('index', {
      title: 'Starfit',
      style: 'style',
      search: ret
    });
  });
});

module.exports = router;
