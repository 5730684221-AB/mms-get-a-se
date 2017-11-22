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
    var timeSlots = [];
    //html form to items list
    for (var key in body) {
      if (body.hasOwnProperty(key)) {
        // console.log(key + " -> " + body[key]);
        if(key.startsWith("times")){
          var a = (key).split("-");
          items[count] = { 
            name : key.substring(6),
            sku : "service",
            // hour : body[key],
            price : service_price_h,
            currency: "THB",
            quantity: body[key]
          };
          timeSlots[count] = key.substring(6);
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
    // console.log("timeSlot =",timeSlot);
    // console.log("items =",items);
    // console.log("tot =",totprice);
    Services.getServiceById(service_id, (err, service) => {
      if (err) {
        console.log("err : ", err);
      }else {
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
        
        var status = "busy";
        service.timeSlots.forEach(function(timeSlot){
          console.log(timeSlot.id);
          timeSlots.forEach(function(slot){
            console.log(slot);
            if(timeSlot.id === slot){
              timeSlot.available = false;
            }
            if(timeSlot.available)status = "available";
          });
          console.log(timeSlot);
        });
    
        var updateQuery = {
          $set : {timeSlots : service.timeSlots},
          status : status
        }
        Services.updateService(service_id,updateQuery,null,function(err,raw){
          console.log("update service");
          if (err) {
            console.log(err);
            req.flash('error', "Something error.");
          }
          console.log(raw);
        });

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
          //update session
          Users.getUserById(uid, (err, user) => {
            if (err) {
              console.log(err);
            } else {
              //update session
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
              req.session.user = userdata;
            }
          });
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
          req.session.payment = null;
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

//service reservation
router.post('/reserve', function (req, res, next) {
  var uid = req.session.user.id;
  console.log(uid);
  var reservation = {};
  var now = Date.now();
  reservation.rid = Date.parse(now);
  reservation.timestamp = now.toString();
  reservation.sid = req.body.sid;
  var keys = Object.keys(req.body);
  var items = [];
  var totalPrice = 0;
  var timeSlots = [];
  //parsing key-value
  for(var i=0;i<keys.length;i++){
    var a = keys[i].split("-");
    if(a.length<=1)continue;
    var item = {};
    //service times
    if(a[0].trim() === "times"){
      //timeslot in serv
      var timeSlot = a[1]+"-"+a[2]+"-"+a[3];
      console.log(timeSlot);
      timeSlots.push(timeSlot);
      //items in res
      item.name = keys[i];
      item.sku = "service";
      item.price = req.body.price;
      item.currency = "THB";
      item.quantity = req.body[keys[i]];
      totalPrice += item.price*item.quantity;
      items.push(item);
      }
      //additional services
      else if(a[0] === "add"){
      item.name = a[1];
      item.sku = "service";
      item.price = req.body[keys[i]];
      item.currency = "THB";
      items.push(item);
      }else if(a[0] === "qty"){
     items.forEach(function(item){
       if(item.name === a[1]){
         item.quantity = req.body[keys[i]];
         totalPrice += item.price*item.quantity;
        }
       });
       //others
      }else continue;
    }
  console.log("items");
  console.log(items);
  var service = Services.getServiceById(reservation.sid,function(err,service){
    if(err){
      console.error('err ', err);
      req.flash('error', "An error occurred.");
      return res.redirect('/service/'+reservation.sid);
    }
    if(service.length <=0){
      console.log("service not found")
      req.flash('error', "Service not found.");
      return res.redirect('/service/'+reservation.sid);
    }
    reservation.sname = service.name;
    reservation.tname = service.tname;
    var status = "busy";
    service.timeSlots.forEach(function(timeSlot){
      console.log(timeSlot.id);
      timeSlots.forEach(function(slot){
        console.log(slot);
        if(timeSlot.id === slot){
          timeSlot.available = false;
        }
        if(timeSlot.available)status = "available";
      });
      console.log(timeSlot);
    });

    var updateQuery = {
      $set : {timeSlots : service.timeSlots},
      status : status
    }
    console.log("update query is ");
    console.log(updateQuery);
    Services.updateService(service.id,updateQuery,null,function(err,raw){
      console.log("update service");
      if (err) {
        console.log(err);
        req.flash('error', "Something error.");
      }
      console.log(raw);
    });
  });

  reservation.items = items;
  reservation.isPaid = false;
  reservation.isReview = false;
  console.log(reservation);
  Users.updateUser(uid, {$push :{reservations: reservation} }, null, (err, user) => {
        console.log("update");
        if (err) {
          console.log(err);
        }
  });
  req.flash("success","reservation successful");
  res.redirect("/service/"+reservation.sid);
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