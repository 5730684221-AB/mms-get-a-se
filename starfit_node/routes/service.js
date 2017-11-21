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

router.post('/pay', function (req, res, next) {
  if (true) { //sessionChecker(req)
    var uid = req.session.user.id
    var body = req.body;
    var service_id = req.body.sid;
    var service_price_h = req.body.price;
    var items = [{}];
    var count = 0;
    var totprice = 0;
    for (var key in body) {
      if (body.hasOwnProperty(key)) {
        // console.log(key + " -> " + body[key]);
        if(key.startsWith("times")){
          items[count] = { 
            name : key.substring(6),
            sku : "service",
            // hour : body[key],
            price : body[key]*service_price_h,
            currency: "THB",
            quantity: 1
          }
          totprice +=body[key]*service_price_h;
          count++;
        }
        if(key.startsWith("add")){
          items[count] = { 
            name : key.substring(4),
            sku : "service",
            price : body[key],
            currency: "THB",
          }
        }
        if(key.startsWith("qty")){
          // console.log(items[count]);
          if(items[count] && items[count].name) {
            items[count].quantity = parseInt(body[key]);
            // console.log("add");
            totprice += body[key]*items[count].price;
            count++;
          }
        }
      }
    }
    // console.log("items =",items);
    // console.log("tot =",totprice);
    Services.getServiceById(service_id, (err, service) => {
      if (err) {
        console.log("err : ", err);
      }else {
        // console.log(service)
        var service_name = service.name;
        var service_about = service.about;
        var service_trainer = service.tname
        var rid = "res"+Date.now();
        var success_url = hostname + '/service/' + rid + '/success';
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
                  "items": items
              },
              "amount": {
                  "currency": "THB",
                  "total": totprice
              },
              "description": service_about
          }]
        };
        req.session.payment = {
          rid: rid,
          totprice : totprice
        };
        var newreservation = {
          rid : rid ,
          sid : service_id ,
          sname : service_name,
          timestamp :  Date.now(),
          tname : service_trainer,
          price : totprice,
          paymethod : "PayPal",
          isPaid : false,
          items : items
          
        }
        updateUser = {
          $push :{reservations : newreservation}
        };
        Users.updateUser(uid, updateUser, null, (err, user) => {
          // console.log("update");
          if (err) {
            console.log(err);
          }

        });
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

router.get('/:rid/success', (req, res, next) => {
  var reserveid = req.params.rid;
  var uid = req.session.user.id;
  // console.log("req.session =",req.session);
  const price = req.session.payment.totprice;
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
  // confirm
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } 
    else {
      //update reserve status
      console.log(JSON.stringify(payment));
      var query = {
        _id : uid,
        "reservations.rid" : reserveid
      }
      var update = {$set :{'reservations.$.isPaid' : true}};
      Users.update(query,update,null, (err, user) => {
        console.log("update reserve status");
        if (err) {
          console.log(err);
          req.flash('error', "Something error.");
        }
      });
      Users.getUserById(uid, (err, user) => {
        if (err) {
          console.log(err);
        } else {
          //update session
          req.session.user = null;
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
          req.flash('success', "Payment successful.");
          req.session.user = userdata;
          res.redirect('/');
        }
      });
    }
  });
});



router.get('/cancel', (req, res) => {
  req.flash('error', "Something error.");
  res.redirect('/');
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