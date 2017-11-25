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
  if(true){ //trainerChecker(req)
    console.log("addservice");
    var newservice = {
      name: req.body.name,
      ttype : req.body.ttype,
      rating : null,
      about : req.body.about,
      price : req.body.price,
      tname : req.session.user.fname +" "+req.session.user.lname,
      place : req.body.place,
      status : "busy"
    };
    // var newservice = {
    //       "name": "newservice",
    //       "ttype" : 3,
    //       "about" : "IDK",
    //       "price" : 500,
    //       "tname" : "GU",
    //       "place" : [1,2,3],
    //       "status" : "busy"
    // }
    console.log("newservice = ",newservice);

    Services.addService(newservice, (err, services) => {
      if (err) {
        console.log("addService error");
        req.flash('error', "Something blew up during addService.");
        res.redirect("/");
        }
        else {
          console.log("services = ", services);
          req.flash('success', "Create new Service successful.");
          res.redirect('/');
        }
    });
  }else{
    req.flash('error', "Pls Login first.");
    res.redirect('/');
  }
});

//add time slot
router.post('/:sid/addtimeslot', function (req, res, next) {
  if(true){ //trainerChecker(req)
    var sid = req.params.sid;
    var newtimeslot = {
      id: req.body.day+"-"+req.body.time[0]+"-"+req.body.time[1],
      day : req.body.day,
      time : req.body.time,
      available : true,
    };
    // var newtimeslot = {
    //   "day" : "Newday",
    //   "time" : [1,2]
    // }
    console.log("new ts = ", newtimeslot);
    updateService = {
      $push: {
        timeSlots : newtimeslot
      }
    }
    Services.updateService(sid, updateService, null, (err, services) => {
      console.log("new ts");
      if (err) {
        console.log(err);
        req.flash('error', "Something error.");
      } else {
        console.log("services = ", services);
        req.flash('success', "Add new timeslot completed.");
        res.redirect("/");
      }
    });
  } else {
    req.flash('error', "Please login.");
    // res.redirect("/");
  }
});

//remove time slot rvmts?tid=day-h1-h2
router.get('/:sid/rvmts', function (req, res, next) {
  if(true){ //trainerChecker(req)
    var sid = req.params.sid;
    var tid = req.query.tid;
    console.log("tid = ", tid);
    updateService = {
        $pull :{timeSlots : {id: tid}}
    }
    Services.updateService(sid, updateService, null, (err, services) => {
      console.log("delete ts");
      if (err) {
        console.log(err);
        req.flash('error', "Something error.");
      } else {
        console.log("services = ", services);
        req.flash('success', "This time slot have been deleted.");
        res.redirect("/");
      }
    });
  } else {
    req.flash('error', "Please login.");
    // res.redirect("/");
  }
});

//add addServ
router.post('/:sid/addserv', function (req, res, next) {
  if(true){ //trainerChecker(req)
    var sid = req.params.sid;
    var newserv = {
      name : req.body.name,
      price : req.body.price
    };
    // var newserv = {
    //   "name" : "TACO",
    //   "price" : 500
    // }
    console.log("newserv = ", newserv);
    updateService = {
      $push: {
        addServ : newserv
      }
    }
    Services.updateService(sid, updateService, null, (err, services) => {
      if (err) {
        console.log(err);
        req.flash('error', "Something error.");
      } else {
        req.flash('success', "Add new serve completed.");
        res.redirect("/");
      }
    });
  } else {
    req.flash('error', "Please login.");
    // res.redirect("/");
  }
});

//remove Serv rmvserv?name=day-h1-h2
router.get('/:sid/rmvserv', function (req, res, next) {
  if(true){ //trainerChecker(req)
    var sid = req.params.sid;
    var sname = req.query.name;
    console.log("sname = ", sname);
    updateService = {
        $pull :{addServ : {name: sname}}
    }
    Services.updateService(sid, updateService, null, (err, service) => {
      if (err) {
        console.log(err);
        req.flash('error', "Something error.");
      } else {
        console.log("delete Serv");
        req.flash('success', "This time slot have been deleted.");
        res.redirect("/");
      }
    });
  } else {
    req.flash('error', "Please login.");
    // res.redirect("/");
  }
});

//update service
router.post('/:sid/update', function (req, res, next) {
  if(true){ //trainerChecker(req)
    var sid = req.params.sid;
    var updateService = {
      name: req.body.name,
      ttype : req.body.ttype,
      about : req.body.about,
      price : req.body.price,
      place : req.body.place,
    };
    console.log("update service = ", updateService);
    Services.updateService(sid, updateService, null, (err, user) => {
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
