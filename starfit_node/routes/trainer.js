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

router.use((req,res,next) =>{
  if (sessionChecker(req)) {
    next();
} else {
  req.flash('error', "Please login.");
  res.redirect("/");
}
});

/* GET trainers listing. */
router.get('/', (req, res, next) => {
  res.render('trainer',{
    title: 'Trainer Menu',
    style: 'style'
  });
});

router.get('/create',(req,res,next) =>{
  res.render('add_service',{
    title: 'Add Service',
    style: 'style'
  });
});

router.post('/create',(req,res,next) => {
 
    var uid = req.session.user.id;
    var user = req.session.user;

    console.log("body",req.body);
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
        res.redirect("/trainer");
      }
      console.log(raw);
      res.redirect("/trainer");
    });
  
});

router.post('/update',(req,res,next) => {
  var uid = req.session.user.id;
  var sid = req.body.sid;
  Services.getServicesById(sid,(err,service) =>{
    if(err){
      console.log(err);
      req.flash("error","An error occurred.");
      res.redirect('back');
    }
    if(!service){
      console.log("no service found");
      req.flash("error","No sevice found");
      res.redirect('back');
    }
    Services.update(sid,req.body,null,(err,service) =>{
      if(err){
        console.log(err);
        req.flash("error","Update failed");
      }
      req.flash("success","Update successfull");
      res.redirect('back');
    });
  });
});

module.exports = router;
