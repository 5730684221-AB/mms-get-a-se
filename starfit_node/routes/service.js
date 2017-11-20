var express = require('express');
var router = express.Router();
var Services = require('../models/services');
var Users = require('../models/users');

router.use(function (req, res, next) {
  res.locals.message = {
    error: req.flash('error'),
    success: req.flash('success')
  }
  if (req.session.user) {
    var fullname = req.session.user.fname + " " + req.session.user.lname;
    req.session.user.name = fullname;
  }
  res.locals.account = req.session.user;
  next();
});

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
    for (var i = 0; i < service.place.length; i++) {
      service.location.push(Services.servicetagToLocation(service.place[i]));
    }

    for (var i = 0; i < service.reviews.length; i++) {
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

    res.render('service', {
      title: 'Starfit',
      style: 'style',
      service: service
    });

  });

});

module.exports = router;