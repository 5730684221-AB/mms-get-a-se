var express = require('express');
var router = express.Router();
var paypal = require('paypal-rest-sdk');

var Services = require('../models/services');
var Users = require('../models/users');

var sessionChecker = function (req) {
  if (req.session.user) {
    //login
    return true;
  } else {
    return false;
  }
};

//payment
const hostname = process.env.HOSTNAME ? process.env.HOSTNAME : 'localhost:3000';

router.post('/:sid/pay', function (req, res, next) {
  if (true) { //sessionChecker(req)
    // var uid = req.session.user.id;
    var service_id = req.params.id;
    Services.getServiceById(service_id, (err, service) => {
      if (err) {
        console.log("err : ", err);
      }else {
        console.log(service)
        var service_name = service.name; //req.body...
        var service_price = service.price;
        var service_about = service.about;
        var success_url = hostname + '/service/' + service_id + '/success';
        var cancel_url = hostname + '/service/cancel';
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
                  "items": [{
                      "name": service_name,
                      "sku": "service",
                      "price": service_price,
                      "currency": "THB",
                      "quantity": 1
                  }]
              },
              "amount": {
                  "currency": "THB",
                  "total": service_price
              },
              "description": service_about
          }]
        };
        paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
              throw error;
          } else {
              console.log("create payment response")
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

router.get('/:sid/success', (req, res) => {
  var service_id = req.params.id;
  var price = "25";
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "THB",
            "total": price
        }
    }]
  };
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
        // update db render recept?
    }
  });
});

router.get('/cancel', (req, res) => {
  res.render("sth went wrong");
});

//get service page
router.get('/:_id', function (req, res, next) {
  var service_id = req.params._id;
  Services.getServiceById(service_id, (err, service) => {
    if(!service){
      req.flash('error', "Service is not found.");
      return res.redirect("/");
    } 
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