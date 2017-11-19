var express = require('express');
var router = express.Router();
var Services = require('../models/services');
var Users = require('../models/users');

var sessionChecker = function (req) {
  if (req.session.user && req.session.id) {
    //login
    return true;
  } else {
    return false;
  }
};

/* GET users listing. */
router.get('/:_id', function (req, res, next) {
  var service_id = req.params._id;
  Services.getServiceById(service_id, (err, service) => {
    
    if (err) {
      console.log("err : ", err);
    }
    var rate = service.rating;
    service.fullstar = 0;
    service.halfstar = 0;
    while (rate > 1) {
      rate--;
      service.fullstar++;
    }
    if (rate > 0) {
      service.halfstar = 1;
    }
    service.emptystar = 5 - service.fullstar - service.halfstar;
    service.location = new Array;
    for(var i=0;i<service.place.length;i++){
      service.location.push(Services.servicetagToLocation(service.place[i]));
    }

    for(var i=0;i<service.reviews.length;i++){
      var rate = service.reviews[i].rating;
      service.reviews[i].fullstar = 0;
      service.reviews[i].halfstar = 0;
      while (rate > 1) {
        rate--;
        service.reviews[i].fullstar++;
      }
      if (rate > 0) {
        service.reviews[i].halfstar = 1;
      }
      service.reviews[i].emptystar = 5 - service.reviews[i].fullstar - service.reviews[i].halfstar;
    }

    if (sessionChecker(req)) {
      var fullname = req.session.user.fname + " " + req.session.user.lname;
      res.render('service', {
        title: 'Starfit',
        style: 'style',
        service: service,
        account: {
          id: req.session.user.id,
          name: fullname
        }
      });
    } else {
      res.render('service', {
        title: 'Starfit',
        style: 'style',
        service: service
      });
    }
  });

});

module.exports = router;