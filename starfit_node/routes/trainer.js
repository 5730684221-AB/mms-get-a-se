var express = require('express');
var router = express.Router();

var Users = require('../models/users');
var Services = require('../models/services');

var trainerChecker = function (req) {
  if (req.session.user) {
    if(req.session.user.trainer){
      return true;
    }else{
      return false;
    }
    
  } else {
      return false;
  }
};

//get trainer page
router.get('/', function(req, res, next) {
  res.render('trainer', {
    title: 'Starfit : Trainer',
    style: 'style'
  });
});

//service addservice
router.post('/addservice', function (req, res, next) {
  if(trainerChecker(req)){
    var newservice = {
      name: req.body.name,
      images: [],
      ttype : req.body.ttype,
      rating : null,
      about : req.body.about,
      price : req.body.price,
      tname : req.session.user.fname +" "+req.session.user.lname,
      place : req.body.place,
      status : "busy",
      timeSlots : []
    };
    Services.addService(newservice, (err, user) => {
      if (err) {
        // res.status(500).send({ error: 'something blew up during signup' });
        req.flash('error', "Something blew up during addService.");
        res.redirect("/");
        console.log("addService error");
      }
      req.flash('success', "Create new Service successful.");
      res.redirect('/');
    });
  }else{
    req.flash('error', "Pls Login first.");
    res.redirect('/');
  }
});

//add time slot
router.post('/:sid/addtimeslot', function (req, res, next) {
});

//remove time slot
router.get('/:sid/rmvtimeslot', function (req, res, next) {
});

//add addServ
router.post('/:sid/addserv', function (req, res, next) {
});

//remove addServ
router.get('/:sid/rmvaddserv', function (req, res, next) {
});

//update service
router.post('/:sid/update', function (req, res, next) {
  if(trainerChecker(req)){
    var sid = req.params.sid;
    var updateService = {
      name: req.body.name,
      ttype : req.body.ttype,
      about : req.body.about,
      price : req.body.price,
      place : req.body.place,
    };
    console.log("update user = ", updateUser);
    Services.updateUser(sid, updateService, null, (err, user) => {
      console.log("update");
      if (err) {
        console.log(err);
        req.flash('error', "Something error.");
      }
      req.flash('success', "Update is successful.");
      res.redirect("/");
    });
  } else {
    req.flash('error', "Please login.");
    // res.redirect("/");
  }
});

router.get('/myservice', function(req, res, next) {
  res.render('my_services', {
    title: 'Starfit : My Services',
    style: 'style'
  });
});

module.exports = router;
