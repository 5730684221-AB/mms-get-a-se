var express = require('express');
var router = express.Router();

var Users = require('../models/users');
var Services = require('../models/services');

var search_test = {
    isSearch : true,
    results : [[{status:'busy',fullstar:4,halfstar:1,emptystar:0},{status:'busy',fullstar:3,halfstar:1,emptystar:1},'c'],[{status:'avaliable',fullstar:5,halfstar:0,emptystar:0},'e','f'],['g']],
    results_count : 7
};

// middleware function to check for logged-in users
var sessionChecker = function (req) {
  if (req.session.user && req.session.id) {
    //login
    return true;
  } else {
    return false;
  }
};

router.get('/', function(req, res, next) {
  console.log("req.session = ",req.session);
  console.log("req.sid = ",req.session.id);
  // console.log("userdata = ", req.session.user);
  if(sessionChecker(req)){
      var fullname = req.session.user.fname + " " + req.session.user.lname;
      res.render('index', { title: 'Index ' + fullname , style: 'style', account:{ isLogin:true, id:1,name : fullname}});
  }else {
      res.render('index', { title: 'Index', style: 'style'});
  }
});

//signup
router.post('/signup', function (req, res) {
    // add new user to db
    var email = req.body.email;
    var newuser = {
      email : req.body.email,
      password : req.body.password,
      fname : req.body.fname,
      lname : req.body.lname,
      phone : req.body.phone
    };
    // if(req.body.password !== req.body.confirmPass){
    //   res.status(500).send({error: 'passwords do not match.'});
    //   console.log("passwords do not match");
    // }
    Users.getUserByE(email,(err, user) => {
      if(err){
        console.log(err);
      }
      if (!user) {
          ////no user
          // res.send("user not found adding new user");
          Users.addUser(newuser,(err,user) => {
              if(err){
                res.status(500).send({ error: 'something blew up during signup' });
                console.log("signup error");
              }
              var userdata = {
                id : user._id,
                email : user.email,
                fname : user.fname,
                lname : user.lname,
                phone : user.phone,
                img: user.img,
                trainer: user.trainer,
                reservations :user.reservations,
                login : true
              };
              console.log("userdata = ",userdata);
              req.session.user = userdata;
              res.redirect('/');

          });
      }else {
        console.log("Email is already in use");
        // res.render('index', { title: 'Index ', style: 'style', wrongmail:true } );
        res.render('error',{ massage : 'Email is already in use"'});
      }
    });
});

//login
router.post('/signin', function (req, res){
    var email = req.body.email,
        password = req.body.password;
    //find one in db
    Users.getUserByE(email,(err, user) => {
      if(err){
        console.log(err);
      }
      // console.log(user);
      // console.log('if' , !user);
      // console.log("password " , password);

      if (!user) {
          ////no user
          res.send("user not found");
      }
      else if (user.password != password) {
          // console.log("correct pw " , user.password);
          console.log("wrong pw");
          //wrong pw
          res.send("wrong pw");
      } else {
          //login sucssessful
          var userdata = {
            id : user._id,
            email : user.email,
            fname : user.fname,
            lname : user.lname,
            phone : user.phone,
            img: user.img,
            trainer: user.trainer,
            reservations :user.reservations,
            login : true
          };
          console.log("userdata = ",userdata);
          req.session.user = userdata;
          // res.render('index', { title: 'Index/login', style: 'style', account:{isLogin:true,id:1,name:"Name1"}});
          res.redirect('/');
      }
    });
    console.log("session ",req.session);
});

//signout
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

//update
router.put('/update', function (req, res){
  if(sessionChecker(req)){
    if(req.body.id){
      var id = req.body.id;
      user = {};
      if(req.body.fname){
        user.fname = req.body.fname;
      }
      if(req.body.lname){
        user.lname = req.body.lname;
      }
      if(req.body.phone){
        user.phone = req.body.phone;
      }
      console.log(user);
      Users.updateUser(id, user, null, (err, user) => {
        console.log("update");
        if(err){
          console.log(err);
        }
        res.send(user);
      });
    }else{
      res.end();
    }
  } else {
      console.log("notlogin");
      res.end();
  }

  // if(req.body.id){
  //   var id = req.body.id;
  //   user = {};
  //   if(req.body.fname){
  //     user.fname = req.body.fname;
  //   }
  //   if(req.body.lname){
  //     user.lname = req.body.lname;
  //   }
  //   if(req.body.phone){
  //     user.phone = req.body.phone;
  //   }
  //   console.log(user);
  //   Users.updateUser(id, user, null, (err, user) => {
  //     if(err){
  //       console.log(err);
  //     }
  //     res.send(user);
  //   });
  // }
});

//search
router.get('/search',function(req,res,next){
  console.log("query ",req.query);
  var query = {};
  if (req.query.searchfor !== '') query.name = { "$regex": req.query.searchfor, "$options": "i" };
  if (req.query.location !== '0') query.place =req.query.location;
  if (req.query.tag !== '0') query.ttype= req.query.tag;
  switch(req.query.price){
    case '0':break;
    case '1':
      query.price = {$lte:500};
      break;
    case '2':
      query.price = {$gte:500,$lte:1000};
      break;
    case '3':
      query.price= {$gte: 1000};
      break;
    default:
      break;
  }
  console.log('query2 ',query);
   Services.find(query).lean().exec(function(err,result){
    console.log('result ',result);
    if(err){
      console.error('err ',err);
      return res.status(500).send("An error occurred.");
    }

    if(result.length<=0){
      console.log("result length < 0");
      return res.status(404).send("No service found.");
    }

    var ret = {};
    ret.results = [];
    var newArray = [];

    //star calculator
    for(var i=0;i<result.length;i++){
      var rate = result[i].rating;
      result[i].fullstar = 0;
      result[i].halfstar = 0;
      while(rate>1){
        rate--;
        result[i].fullstar++;
      }
      if(rate>0){
        result[i].halfstar=1;
      }
      result[i].emptystar = 5-result[i].fullstar-result[i].halfstar;
    }

    //search result calculator
    for(var i=0;i<result.length;i++){
      if(i%3==0){
        newArray = [];
      }
      newArray.push(result[i]);
      if(i%3==2){
        ret.results.push(newArray);
      }
    }



    console.log("newArray ",newArray);
    if((result.length%3)>0){
      ret.results.push(newArray);
    }

    ret.isSearch = true;
    ret.results_count = result.length;
    console.log('ret ',ret);
    //res.status(200).send(ret);

        res.render('index', { title: 'Index/login', style: 'style',search:ret});
      });
});

module.exports = router;
