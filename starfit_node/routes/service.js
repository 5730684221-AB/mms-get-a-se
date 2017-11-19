var express = require('express');
var router = express.Router();
var Services = require('../models/services');
var Users = require('../models/users');

/* GET users listing. */
router.get('/:_id', function (req, res, next) {
  var service_id = req.params._id;
  Services.getServiceById(service_id, (err, service) => {
    console.log("Service = ", service);
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
    res.render('service', {
      title: 'Index',
      style: 'style',
      service: service
    });
  });

});

module.exports = router;