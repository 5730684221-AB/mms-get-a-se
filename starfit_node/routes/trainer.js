var express = require('express');
var router = express.Router();

var Users = require("../models/users");
var Services = require("../models/services");

var sessionChecker = function (req) {
  if (req.session.user) {
    //login
    return true;
  } else {
    return false;
  }
};

/* GET trainers listing. */
router.get('/', (req, res, next) => {
  res.render('trainer',{
    title: 'Trainer Menu',
    style: 'style'
  });
});

router.post('/create',(req,res,next) => {
  if (sessionChecker(req)) {
    var uid = req.session.user.id;
    var user = req.session.user;
    var service = {
      name : req.body.name,
      ttype : req.body.ttype,
      rating : 0,
      about : req.body.about,
      price : req.body.price,
      tname : user.fname+" "+user.lname,
      place : req.body.place,
      status : "available",
      timeSlots : req.body.timeSlots,
      addServ : req.body.addServ
    };

    Services.addService(service,(err,raw) =>{
      if(err){
        console.log(err);
        req.flash("error","An error occurred");
        res.redirect("back");
      }
      console.log(raw);
      
    });

    
  } else {
    req.flash('error', "Please login.");
    res.redirect("/");
  }
});

module.exports = router;
