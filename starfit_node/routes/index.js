var express = require('express');
var router = express.Router();
var paypal = require('paypal-rest-sdk');

var Users = require('../models/users');
var Services = require('../models/services');

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILUNAME,
    pass: process.env.NODEMAILPASS
  }
});

const hostname = process.env.HOSTNAME ? process.env.HOSTNAME : 'localhost:3000';

var sessionChecker = function (req) {
  if (req.session.user) {
    //login
    return true;
  } else {
    return false;
  }
};

//home
router.get('/', function (req, res, next) {
  console.log("req.session = ", req.session);
  console.log("res locals = ", res.locals);

  res.render('index', {
    title: 'Starfit',
    style: 'style'
  });
});

//user signup
router.post('/signup', function (req, res, next) {
  // add new user to db
  var email = req.body.email.toLowerCase();
  var newuser = {
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    fname: req.body.fname,
    lname: req.body.lname,
    phone: req.body.phone

  };
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

//user login
router.post('/signin', function (req, res, next) {
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

//user signout
router.get('/signout', function (req, res, next) {
  console.log("session ", req.session);
  if (req.session) {
    // delete session object
    req.session = null
    res.redirect('/');
    console.log("session ", req.session);
  }
});

//user profile
router.get('/profile', function (req, res, next) {
  if (req.session.user) {
    var profile_id = req.session.user.id;
    if (req.session.user.id === profile_id) {
      var fullname = req.session.user.fname + " " + req.session.user.lname;
      res.render('profile', {
        title: 'Starfit : My Profile',
        style: 'style'
      });
    } else {
      req.flash('error', "You don't have permission.");
      res.redirect('/');
    }
  } else {
    req.flash('error', "Please login.");
    res.redirect('/');
  }
});

//update user profile
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
    console.log("update user = ", updateUser);
    Users.updateUser(id, updateUser, null, (err, user) => {
      console.log("update");
      if (err) {
        console.log(err);
        req.flash('error', "Something error.");
      }
      req.session.user.fname = updateUser.fname;
      req.session.user.lname = updateUser.lname;
      req.session.user.phone = updateUser.phone;
      console.log("session router = ", req.session.user);
      req.flash('success', "Update is successful.");
      res.redirect("/");
    });
  } else {
    req.flash('error', "Please login.");
    // res.redirect("/");
  }
});

//forgot password
router.post('/reset', function (req, res, next) {
  var email = req.body.email.toLowerCase();
  //find one in db
  Users.getUserByE(email, (err, user) => {
    if (err) {
      console.log(err);
    }
    if (!user) {
      //no user
      req.flash('error', "Incorrect email");
      res.redirect("/");
    } else {
      //find user
      var resetsecret = Date.now();
      var fullname = user.fname + " " + user.lname;
      var userid = user.id;
      var updateUser = {
        secret: resetsecret
      };
      var reseturi = hostname + '/reset/' + userid + '/' + resetsecret;
      Users.updateUser(userid, updateUser, null, (err, user) => {
        console.log("update");
        if (err) {
          console.log(err);
          req.flash('error', "Something error.");
        }
        /*--------email--------*/
        var mail = {
          from: '"🌟 STARFIT.com 🌟" <starfit.automail@gmail.com>',
          to: email,
          subject: 'STARFIT Password reset for ' + fullname,
          text: 'Hello, ' + fullname + ', Your password reset url is: ' + reseturi,
          html: 'Hello, <b>' + fullname + '</b>, Your password reset url is: ' + reseturi
        }

        transporter.sendMail(mail);
        console.log("updateUser = ", updateUser);
        req.flash('success', "Password reset have been sent to your email");
        res.redirect('/');
      });
    }
  });
});

//get new pw page
router.get('/reset/:id/:resetsecret', function (req, res, next) {
  var uid = req.params.id;
  var resetsecret = req.params.resetsecret;
  console.log('uid ', uid);
  console.log('resetsecret ', resetsecret);
  if (resetsecret == null) {
    res.redirect("/");
    return;
  }
  Users.getUserById(uid, (err, user) => {
    if (err) {
      console.log(err);
    }
    if (!user) {
      res.redirect("/");
      return;
    } else if (user.secret != resetsecret) {
      req.flash('error', "You don't have permission");
      res.redirect("/");
      return;
    } else {
      //correct secret render new password page
      res.render("reset", {
        title: 'Starfit : Reset Password',
        style: 'style',
        id: uid,
        reset: resetsecret
      });
    }
  });
});

//reset pw
router.post('/reset/:id/:resetsecret', function (req, res, next) {
  var id = req.params.id;
  var resetsecret = req.params.resetsecret;
  var password = req.body.password;
  if (resetsecret == null) {
    res.redirect("/");
    return;
  }
  Users.getUserById(id, (err, user) => {
    if (err) {
      console.log(err);
    }
    if (!user) {
      res.redirect("/");
      return;
    } else if (user.secret != resetsecret) {
      res.redirect("/");
      return;
    } else {
      //correct secret update new password
      updateUser = {
        password: password,
        secret: null
      };
      Users.updateUser(id, updateUser, null, (err, user) => {
        console.log("update");
        if (err) {
          console.log(err);
          req.flash('error', "Something error.");
        }
        req.flash('success', "Password reset is successful.");
        res.redirect("/");
      });
    }
  });

});

//search service profile
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
      result[i].emptystar = 5 - result[i].fullstar - result[i].halfstar;
      //calculating availability
      result[i].status = "busy";
      for (var j = 0; j < result[i].timeSlots.length; j++) {
        if (result[i].timeSlots[j].available) {
          result[i].status = "available";
          break;
        }
      }
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

//my reservation
router.get('/reservation', function (req, res, next) {
  res.render('reservation', {
    title: 'Starfit : My Reservation',
    style: 'style'
  });
});

//pay my reservation
router.get('/reservation/pay/:rid', function (req, res, next) {
  if (sessionChecker(req)) {
    var uid = req.session.user.id; //req.session.user.id
    var rid = req.params.rid; //req.params.rid
    var query = {
      "_id" : uid,
    }
    Users.findOne(query, (err, user) => {
      if (err) {
        console.log(err);
      }
      if(!user) {
        //user not found
      }
      else{
        // console.log("user",user);
        var reservations = user.reservations;
        var reservation = {};
        for (var i = 0; i < reservations.length; i++) {
          if(reservations[i].rid === rid) {
            reservation = reservations[i];
          }
        }
        // console.log("reservation ",reservation);
        var success_url = hostname + '/service/' + rid + '/success';
        var cancel_url = hostname + '/service/cancel';
        var itemsdb = reservation.items;
        var total = reservation.price;
        var items = [{}];
        // console.log(itemsdb);
        // console.log(total);

        for (var i = 0; i < itemsdb.length; i++) {
          var itemdb = itemsdb[i];
          items[i].name = itemdb.name;
          items[i].sku = itemdb.sku;
          items[i].price = itemdb.price;
          items[i].currency = itemdb.currency;
          items[i].quantity = itemdb.quantity;
        }
        console.log(items);

        var create_payment_json = {
          "intent": "sale",
          "payer": {
              "payment_method": "paypal"
          },
          "redirect_urls": {
              "return_url": success_url,
              "cancel_url": cancel_url
          },
          "transactions": [{
              "item_list": {
                  "items": items
              },
              "amount": {
                  "currency": "THB",
                  "total": total
              },
              "description": "STARFIT BOOKING"
          }]
        };

        console.log("create_payment_json",create_payment_json)
        // res.send(create_payment_json);
        
        req.session.payment = {
          rid: rid,
          totprice : total
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
              throw error;
          } else {
            console.log("create payment response = ")
            console.log(payment);
            for(var i = 0;i < payment.links.length;i++){
              if(payment.links[i].rel === 'approval_url'){
                res.redirect(payment.links[i].href);
              }
            }
          }
        });
      }
    });
  } else {
    req.flash('error', "Please login.");
    res.redirect("/");
  }
});

router.get('/reservation/:rid', function (req, res, next) {
  var rid = req.params.rid;
  if (!rid) {
    req.flash("error", "Something error!");
    res.redirect('/');
  } else {
    var reservations = req.session.user.reservations;
    var reservation = {};
    for(var i=0;i<reservations.length;i++){
      if(reservations[i].rid == rid){
        reservation = reservations[i];
        var date =  new Date(parseInt(reservation.timestamp));
        reservation.date = date;
      }
    }
    console.log("reservation == ",reservation);
    res.render('reserve', {
      title: 'Starfit : My Reservation',
      style: 'style',
      reservation: reservation
    });
  }
});

//review
router.get('/review/:sid', function (req, res, next) {
  var sid = req.params.sid;
  res.render('review', {
    title: 'Starfit : Review',
    style: 'style'
  });
});

router.post('/checkout', function (req, res, next) {
  res.send(req.body);
});

router.post('/checkout2', function (req, res, next) {
  res.send(req.body);
});

module.exports = router;